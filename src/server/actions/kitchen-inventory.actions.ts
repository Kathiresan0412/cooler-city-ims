"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { hasKitchenInventoryPermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const quantitySchema = z.number().finite().positive().max(999999999);
const issueSchema = z.object({
  productId: z.string().min(1),
  receiverName: z.string().trim().min(1).max(120),
  quantity: quantitySchema,
  notes: z.string().trim().max(500).optional(),
});
const returnSchema = z.object({
  issueId: z.string().min(1),
  quantity: quantitySchema,
});
const completeSchema = z.object({
  issueId: z.string().min(1),
});
const MAIN_WAREHOUSE_CODE = "WH-MAIN";

function validatePrecision(quantity: number) {
  if (new Prisma.Decimal(quantity).decimalPlaces() > 4) {
    return "Quantity supports up to 4 decimal places";
  }
  return null;
}

function handleTransactionError(error: unknown) {
  if (error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return { success: false as const, error: error.message };
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
    return { success: false as const, error: "Stock changed while saving. Refresh and try again." };
  }
  throw error;
}

export async function issueToKitchen(data: {
  productId: string;
  receiverName: string;
  quantity: number;
  notes?: string;
}) {
  const parsed = issueSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid kitchen issue details" };
  }
  const precisionError = validatePrecision(parsed.data.quantity);
  if (precisionError) return { success: false, error: precisionError };

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "You must be signed in to issue stock" };
  if (!(await hasKitchenInventoryPermission(userId))) {
    return { success: false, error: "You do not have permission to manage kitchen inventory" };
  }

  const quantity = new Prisma.Decimal(parsed.data.quantity);
  try {
    await prisma.$transaction(async (transaction) => {
      const [product, location, stock] = await Promise.all([
        transaction.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true, isActive: true } }),
        transaction.location.findUnique({
          where: { code: MAIN_WAREHOUSE_CODE },
          select: { id: true, isActive: true, isWarehouse: true },
        }),
        transaction.stock.findFirst({
          where: {
            productId: parsed.data.productId,
            location: { code: MAIN_WAREHOUSE_CODE, isActive: true, isWarehouse: true },
          },
          select: { quantity: true, locationId: true },
        }),
      ]);
      if (!product?.isActive) throw new Error("Selected product was not found or is inactive");
      if (!location?.isActive || !location.isWarehouse) {
        throw new Error("The active main warehouse (WH-MAIN) was not found");
      }
      const openIssues = await transaction.kitchenIssue.findMany({
        where: {
          productId: parsed.data.productId,
          completedAt: null,
        },
        select: { id: true, issuedQuantity: true, returnedQuantity: true },
      });
      if (openIssues.some((issue) => issue.returnedQuantity.lessThan(issue.issuedQuantity))) {
        throw new Error("This product already has an open kitchen issue. Return or complete it before issuing more.");
      }
      if (!stock || stock.quantity.lessThan(quantity)) {
        throw new Error("The main warehouse does not have enough stock");
      }

      const update = await transaction.stock.updateMany({
        where: {
          productId: parsed.data.productId,
          locationId: location.id,
          quantity: { gte: quantity },
        },
        data: { quantity: { decrement: quantity } },
      });
      if (update.count !== 1) throw new Error("Stock changed while saving. Refresh and try again.");

      const balanceAfter = stock.quantity.sub(quantity);
      const issue = await transaction.kitchenIssue.create({
        data: {
          productId: parsed.data.productId,
          locationId: location.id,
          receiverName: parsed.data.receiverName,
          issuedQuantity: quantity,
          notes: parsed.data.notes || null,
          createdById: userId,
        },
      });
      await transaction.stockLedger.create({
        data: {
          productId: parsed.data.productId,
          locationId: location.id,
          movementType: "KITCHEN_ISSUE",
          quantityOut: quantity,
          balanceAfter,
          referenceType: "KITCHEN_ISSUE",
          referenceId: issue.id,
          note: parsed.data.notes
            ? `Issued to ${parsed.data.receiverName}: ${parsed.data.notes}`
            : `Issued to ${parsed.data.receiverName}`,
          createdById: userId,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId,
          action: "ISSUE",
          resource: "Kitchen Inventory",
          resourceId: issue.id,
          newData: {
            productId: parsed.data.productId,
            receiverName: parsed.data.receiverName,
            quantity: quantity.toNumber(),
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return handleTransactionError(error);
  }

  revalidatePath("/kitchen-inventory");
  revalidatePath("/stock");
  revalidatePath("/");
  revalidatePath("/products");
  return { success: true, error: null };
}

export async function returnFromKitchen(data: { issueId: string; quantity: number }) {
  const parsed = returnSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid kitchen return details" };
  }
  const precisionError = validatePrecision(parsed.data.quantity);
  if (precisionError) return { success: false, error: precisionError };

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "You must be signed in to return stock" };
  if (!(await hasKitchenInventoryPermission(userId))) {
    return { success: false, error: "You do not have permission to manage kitchen inventory" };
  }

  const quantity = new Prisma.Decimal(parsed.data.quantity);
  try {
    await prisma.$transaction(async (transaction) => {
      const issue = await transaction.kitchenIssue.findUnique({
        where: { id: parsed.data.issueId },
        select: {
          id: true,
          productId: true,
          locationId: true,
          issuedQuantity: true,
          returnedQuantity: true,
          completedAt: true,
        },
      });
      if (!issue) throw new Error("Kitchen issue was not found");
      if (issue.completedAt) throw new Error("This kitchen issue is already complete");
      if (issue.returnedQuantity.add(quantity).greaterThan(issue.issuedQuantity)) {
        throw new Error("Return quantity exceeds the amount still outstanding");
      }

      const update = await transaction.kitchenIssue.updateMany({
        where: {
          id: issue.id,
          completedAt: null,
          returnedQuantity: { lte: issue.issuedQuantity.sub(quantity) },
        },
        data: { returnedQuantity: { increment: quantity } },
      });
      if (update.count !== 1) throw new Error("Kitchen issue changed while saving. Refresh and try again.");

      const stock = await transaction.stock.upsert({
        where: { productId_locationId: { productId: issue.productId, locationId: issue.locationId } },
        create: { productId: issue.productId, locationId: issue.locationId, quantity },
        update: { quantity: { increment: quantity } },
        select: { quantity: true },
      });
      await transaction.stockLedger.create({
        data: {
          productId: issue.productId,
          locationId: issue.locationId,
          movementType: "KITCHEN_RETURN",
          quantityIn: quantity,
          balanceAfter: stock.quantity,
          referenceType: "KITCHEN_ISSUE",
          referenceId: issue.id,
          note: "Returned from kitchen",
          createdById: userId,
        },
      });
      await transaction.auditLog.create({
        data: {
          userId,
          action: "RETURN",
          resource: "Kitchen Inventory",
          resourceId: issue.id,
          oldData: { returnedQuantity: issue.returnedQuantity.toNumber() },
          newData: {
            returnedQuantity: issue.returnedQuantity.add(quantity).toNumber(),
            quantityReturned: quantity.toNumber(),
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return handleTransactionError(error);
  }

  revalidatePath("/kitchen-inventory");
  revalidatePath("/stock");
  revalidatePath("/");
  revalidatePath("/products");
  return { success: true, error: null };
}

export async function completeKitchenIssue(data: { issueId: string }) {
  const parsed = completeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid kitchen issue details" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "You must be signed in to complete a kitchen issue" };
  if (!(await hasKitchenInventoryPermission(userId))) {
    return { success: false, error: "You do not have permission to manage kitchen inventory" };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      const issue = await transaction.kitchenIssue.findUnique({
        where: { id: parsed.data.issueId },
        select: {
          id: true,
          issuedQuantity: true,
          returnedQuantity: true,
          completedAt: true,
        },
      });
      if (!issue) throw new Error("Kitchen issue was not found");
      if (issue.completedAt || issue.returnedQuantity.greaterThanOrEqualTo(issue.issuedQuantity)) {
        throw new Error("This kitchen issue is already closed");
      }

      const completedAt = new Date();
      const update = await transaction.kitchenIssue.updateMany({
        where: {
          id: issue.id,
          completedAt: null,
          returnedQuantity: { lt: issue.issuedQuantity },
        },
        data: { completedAt },
      });
      if (update.count !== 1) throw new Error("Kitchen issue changed while saving. Refresh and try again.");

      await transaction.auditLog.create({
        data: {
          userId,
          action: "COMPLETE",
          resource: "Kitchen Inventory",
          resourceId: issue.id,
          newData: {
            completedAt: completedAt.toISOString(),
            consumedQuantity: issue.issuedQuantity.sub(issue.returnedQuantity).toNumber(),
          },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    return handleTransactionError(error);
  }

  revalidatePath("/kitchen-inventory");
  return { success: true, error: null };
}
