"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const adjustmentSchema = z.object({
  productId: z.string().min(1),
  locationId: z.string().min(1),
  quantity: z.number().finite().min(0).max(999999999),
  mode: z.enum(["add", "set"]),
});

export async function adjustProductStock(data: {
  productId: string;
  locationId: string;
  quantity: number;
  mode: "add" | "set";
}) {
  await requirePermission("stock", "adjust");
  const parsed = adjustmentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid stock details" };
  }

  const targetQuantity = new Prisma.Decimal(parsed.data.quantity);
  if (targetQuantity.decimalPlaces() > 4) {
    return { success: false, error: "Quantity supports up to 4 decimal places" };
  }

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "You must be signed in to adjust stock" };

  try {
    await prisma.$transaction(async (transaction) => {
      const [product, location, total] = await Promise.all([
        transaction.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true, isActive: true } }),
        transaction.location.findUnique({ where: { id: parsed.data.locationId }, select: { id: true, isActive: true } }),
        transaction.stock.aggregate({
          where: { productId: parsed.data.productId },
          _sum: { quantity: true },
        }),
      ]);
      if (!product || !product.isActive) throw new Error("Selected product was not found or is inactive");
      if (!location || !location.isActive) throw new Error("Selected location was not found or is inactive");

      const currentTotal = total._sum.quantity ?? new Prisma.Decimal(0);
      const delta = parsed.data.mode === "add" ? targetQuantity : targetQuantity.sub(currentTotal);
      if (delta.isZero()) return;

      const currentLocation = await transaction.stock.findUnique({
        where: {
          productId_locationId: {
            productId: parsed.data.productId,
            locationId: parsed.data.locationId,
          },
        },
        select: { quantity: true },
      });
      const locationBalance = currentLocation?.quantity ?? new Prisma.Decimal(0);
      const nextLocationBalance = locationBalance.add(delta);
      if (nextLocationBalance.isNegative()) {
        throw new Error("The selected location does not have enough stock for this reduction");
      }

      await transaction.stock.upsert({
        where: {
          productId_locationId: {
            productId: parsed.data.productId,
            locationId: parsed.data.locationId,
          },
        },
        create: {
          productId: parsed.data.productId,
          locationId: parsed.data.locationId,
          quantity: delta,
        },
        update: { quantity: { increment: delta } },
      });

      await transaction.stockLedger.create({
        data: {
          productId: parsed.data.productId,
          locationId: parsed.data.locationId,
          movementType: delta.isPositive() ? "ADJUSTMENT_ADD" : "ADJUSTMENT_REMOVE",
          quantityIn: delta.isPositive() ? delta : new Prisma.Decimal(0),
          quantityOut: delta.isNegative() ? delta.abs() : new Prisma.Decimal(0),
          balanceAfter: nextLocationBalance,
          referenceType: "ADJUSTMENT",
          note: parsed.data.mode === "add" ? "Manual stock addition" : "Manual aggregate quantity update",
          createdById: userId,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Error && !(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return { success: false, error: error.message };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return { success: false, error: "Stock changed while saving. Refresh and try again." };
    }
    throw error;
  }

  revalidatePath("/stock");
  revalidatePath("/");
  revalidatePath("/products");
  return { success: true, error: null };
}

export async function createAdjustment(data: Record<string, unknown>) {
  console.info("createAdjustment stub", data);
  return { id: "stub-adjustment-id", error: null };
}
