"use server";

import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  categoryId: z.string().optional(),
  unitId: z.string().optional(),
  costPrice: z.number().finite().min(0, "Cost price cannot be negative"),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
  excludeFromLowStock: z.boolean().optional(),
});

export async function createProduct(data: {
  name: string;
  categoryId?: string;
  unitId?: string;
  costPrice: number;
  imageUrl?: string;
  excludeFromLowStock?: boolean;
}) {
  await requirePermission("products", "create");
  const session = await auth();
  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { id: null, error: parsed.error.issues[0]?.message ?? "Invalid product details" };
  }

  const [category, unit] = await Promise.all([
    parsed.data.categoryId
      ? prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } })
      : Promise.resolve(null),
    parsed.data.unitId
      ? prisma.unit.findUnique({ where: { id: parsed.data.unitId }, select: { id: true } })
      : Promise.resolve(null),
  ]);
  if (parsed.data.categoryId && !category) return { id: null, error: "Selected category was not found" };
  if (parsed.data.unitId && !unit) return { id: null, error: "Selected unit was not found" };

  const product = await prisma.$transaction(async (transaction) => {
    const createdProduct = await transaction.product.create({
      data: {
        name: parsed.data.name,
        sku: `AUTO-${randomUUID()}`,
        categoryId: parsed.data.categoryId || null,
        unitId: parsed.data.unitId || null,
        costPrice: parsed.data.costPrice,
        imageUrl: parsed.data.imageUrl || null,
        excludeFromLowStock: parsed.data.excludeFromLowStock ?? false,
      },
      select: { id: true, name: true, sku: true },
    });
    await transaction.auditLog.create({
      data: {
        userId: session?.user?.id,
        action: "CREATE",
        resource: "Product",
        resourceId: createdProduct.id,
        newData: { name: createdProduct.name, sku: createdProduct.sku },
      },
    });
    return createdProduct;
  });

  revalidatePath("/products");
  revalidatePath("/");
  revalidatePath("/reports/low-stock");
  return { id: product.id, error: null };
}

export async function updateProduct(
  productId: string,
  data: { name: string; categoryId?: string; unitId?: string; costPrice: number; imageUrl?: string; excludeFromLowStock?: boolean }
) {
  await requirePermission("products", "update");
  const session = await auth();
  const id = z.string().min(1).safeParse(productId);
  const parsed = productSchema.safeParse(data);
  if (!id.success) return { success: false, error: "Invalid product" };
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid product details" };
  }

  const [category, unit] = await Promise.all([
    parsed.data.categoryId
      ? prisma.category.findUnique({ where: { id: parsed.data.categoryId }, select: { id: true } })
      : Promise.resolve(null),
    parsed.data.unitId
      ? prisma.unit.findUnique({ where: { id: parsed.data.unitId }, select: { id: true } })
      : Promise.resolve(null),
  ]);
  if (parsed.data.categoryId && !category) return { success: false, error: "Selected category was not found" };
  if (parsed.data.unitId && !unit) return { success: false, error: "Selected unit was not found" };

  try {
    await prisma.$transaction(async (transaction) => {
      const updatedProduct = await transaction.product.update({
        where: { id: id.data },
        data: {
          name: parsed.data.name,
          categoryId: parsed.data.categoryId || null,
          unitId: parsed.data.unitId || null,
          costPrice: parsed.data.costPrice,
          imageUrl: parsed.data.imageUrl || null,
          excludeFromLowStock: parsed.data.excludeFromLowStock ?? false,
        },
        select: { id: true, name: true, sku: true },
      });
      await transaction.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: "UPDATE",
          resource: "Product",
          resourceId: updatedProduct.id,
          newData: { name: updatedProduct.name, sku: updatedProduct.sku },
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Product not found" };
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id.data}`);
  revalidatePath("/");
  revalidatePath("/reports/low-stock");
  return { success: true, error: null };
}

export async function deleteProduct(productId: string) {
  await requirePermission("products", "delete");
  const id = z.string().min(1).safeParse(productId);
  if (!id.success) return { success: false, error: "Invalid product" };

  const session = await auth();
  try {
    const result = await prisma.$transaction(async (transaction) => {
      const product = await transaction.product.findUnique({
        where: { id: id.data },
        select: {
          id: true,
          name: true,
          stockEntries: { select: { quantity: true } },
          _count: {
            select: {
              ledgerEntries: true,
              grnItems: true,
              transferItems: true,
              requestItems: true,
              poItems: true,
              saleItems: true,
              returnItems: true,
              adjustmentItems: true,
              stockTakeItems: true,
              kitchenIssues: true,
              serialNumbers: true,
            },
          },
        },
      });
      if (!product) return { success: false as const, error: "Product not found. It may already have been deleted." };

      const stockTotal = product.stockEntries.reduce(
        (sum, entry) => sum + Math.max(0, Number(entry.quantity)),
        0,
      );
      if (stockTotal > 0) {
        return {
          success: false as const,
          error: `Cannot delete “${product.name}” because it has ${stockTotal} units in stock. Move or adjust the stock to zero first.`,
        };
      }

      const linkedRecords: { label: string; count: number }[] = [
        { label: "inventory movements", count: product._count.ledgerEntries },
        { label: "goods received notes", count: product._count.grnItems },
        { label: "transfers", count: product._count.transferItems },
        { label: "stock requests", count: product._count.requestItems },
        { label: "purchase orders", count: product._count.poItems },
        { label: "sales", count: product._count.saleItems },
        { label: "returns", count: product._count.returnItems },
        { label: "stock adjustments", count: product._count.adjustmentItems },
        { label: "stock takes", count: product._count.stockTakeItems },
        { label: "kitchen issues", count: product._count.kitchenIssues },
        { label: "serial numbers", count: product._count.serialNumbers },
      ].filter((record) => record.count > 0);

      if (linkedRecords.length > 0) {
        return {
          success: false as const,
          error: `Cannot delete “${product.name}” because it is linked to ${linkedRecords.map(({ label, count }) => `${count} ${label}`).join(", ")}. Keep it for these records or deactivate it instead.`,
        };
      }

      await transaction.stock.deleteMany({ where: { productId: product.id } });
      await transaction.product.delete({ where: { id: product.id } });
      await transaction.auditLog.create({
        data: {
          userId: session?.user?.id,
          action: "DELETE",
          resource: "Product",
          resourceId: product.id,
          oldData: { name: product.name },
        },
      });

      return { success: true as const, error: null };
    });

    if (!result.success) return result;
    revalidatePath("/products");
    revalidatePath("/stock");
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        success: false,
        error: "Cannot delete this product because another inventory record still refers to it. Keep the product or deactivate it instead.",
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Product not found. It may already have been deleted." };
    }
    throw error;
  }
}
