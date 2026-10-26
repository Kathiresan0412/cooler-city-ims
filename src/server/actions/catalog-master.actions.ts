"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const nameSchema = z.string().trim().min(1, "Name is required").max(100);
const descriptionSchema = z.string().trim().max(500).optional();
const unitSchema = z.object({
  name: nameSchema,
  abbreviation: z.string().trim().min(1, "Abbreviation is required").max(20),
});

const categorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export async function createCategory(data: { name: string; description?: string }) {
  await requirePermission("categories", "manage");
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid category details" };

  try {
    await prisma.category.create({ data: parsed.data });
    revalidatePath("/categories");
    revalidatePath("/products/new");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A category with this name already exists" };
    }
    throw error;
  }
}

export async function updateCategory(id: string, data: { name: string; description?: string }) {
  await requirePermission("categories", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  const parsed = categorySchema.safeParse(data);
  if (!parsedId.success || !parsed.success) {
    return { success: false, error: !parsed.success ? parsed.error.issues[0]?.message ?? "Invalid category details" : "Invalid category" };
  }

  try {
    await prisma.category.update({ where: { id: parsedId.data }, data: parsed.data });
    revalidatePath("/categories");
    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A category with this name already exists" };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Category not found" };
    }
    throw error;
  }
}

export async function deleteCategory(id: string) {
  await requirePermission("categories", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid category" };

  const category = await prisma.category.findUnique({
    where: { id: parsedId.data },
    select: { id: true, _count: { select: { products: true, children: true } } },
  });
  if (!category) return { success: false, error: "Category not found" };
  if (category._count.products > 0 || category._count.children > 0) {
    return {
      success: false,
      error: "This category is assigned to products or child categories. Reassign or remove them before deleting it.",
    };
  }

  try {
    await prisma.category.delete({ where: { id: category.id } });
    revalidatePath("/categories");
    revalidatePath("/products/new");
    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: "This category is in use and cannot be deleted" };
    }
    throw error;
  }
}

export async function createUnit(data: { name: string; abbreviation: string }) {
  await requirePermission("units", "manage");
  const parsed = unitSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid unit details" };

  try {
    await prisma.unit.create({ data: parsed.data });
    revalidatePath("/units");
    revalidatePath("/products/new");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A unit with this name or abbreviation already exists" };
    }
    throw error;
  }
}

export async function updateUnit(id: string, data: { name: string; abbreviation: string }) {
  await requirePermission("units", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  const parsed = unitSchema.safeParse(data);
  if (!parsedId.success || !parsed.success) {
    return { success: false, error: !parsed.success ? parsed.error.issues[0]?.message ?? "Invalid unit details" : "Invalid unit" };
  }

  try {
    await prisma.unit.update({ where: { id: parsedId.data }, data: parsed.data });
    revalidatePath("/units");
    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A unit with this name or abbreviation already exists" };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "Unit not found" };
    }
    throw error;
  }
}

export async function deleteUnit(id: string) {
  await requirePermission("units", "manage");
  const parsedId = z.string().min(1).safeParse(id);
  if (!parsedId.success) return { success: false, error: "Invalid unit" };

  const unit = await prisma.unit.findUnique({
    where: { id: parsedId.data },
    select: { id: true, _count: { select: { products: true } } },
  });
  if (!unit) return { success: false, error: "Unit not found" };
  if (unit._count.products > 0) {
    return { success: false, error: "This unit is assigned to products. Reassign those products before deleting it." };
  }

  try {
    await prisma.unit.delete({ where: { id: unit.id } });
    revalidatePath("/units");
    revalidatePath("/products/new");
    revalidatePath("/products");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return { success: false, error: "This unit is in use and cannot be deleted" };
    }
    throw error;
  }
}
