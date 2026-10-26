"use server";

import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  categoryId: z.string().optional(),
  unitId: z.string().optional(),
  costPrice: z.number().finite().min(0, "Cost price cannot be negative"),
  imageUrl: z.string().trim().url().or(z.literal("")).optional(),
});

export async function createProduct(data: {
  name: string;
  categoryId?: string;
  unitId?: string;
  costPrice: number;
  imageUrl?: string;
}) {
  await requirePermission("products", "create");
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

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      sku: `AUTO-${randomUUID()}`,
      categoryId: parsed.data.categoryId || null,
      unitId: parsed.data.unitId || null,
      costPrice: parsed.data.costPrice,
      imageUrl: parsed.data.imageUrl || null,
    },
    select: { id: true },
  });

  revalidatePath("/products");
  return { id: product.id, error: null };
}

export async function updateProduct(
  productId: string,
  data: { name: string; categoryId?: string; unitId?: string; costPrice: number; imageUrl?: string }
) {
  await requirePermission("products", "update");
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
    await prisma.product.update({
      where: { id: id.data },
      data: {
        name: parsed.data.name,
        categoryId: parsed.data.categoryId || null,
        unitId: parsed.data.unitId || null,
        costPrice: parsed.data.costPrice,
        imageUrl: parsed.data.imageUrl || null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Product not found" };
    }
    throw error;
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id.data}`);
  return { success: true, error: null };
}
