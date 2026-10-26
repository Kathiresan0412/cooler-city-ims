"use server";

import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const userDetailsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email address").max(255),
  roleId: z.string().min(1, "Role is required"),
});

const createUserSchema = userDetailsSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateUserSchema = userDetailsSchema.extend({
  password: z.union([z.literal(""), z.string().min(8, "Password must be at least 8 characters")]).optional(),
});

async function validateRole(roleId?: string | null) {
  if (!roleId) return true;
  return Boolean(await prisma.role.findUnique({ where: { id: roleId }, select: { id: true } }));
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: string;
}) {
  await requirePermission("users", "create");
  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { id: null, error: parsed.error.issues[0]?.message ?? "Invalid user details" };
  }
  if (!(await validateRole(parsed.data.roleId))) {
    return { id: null, error: "Selected role was not found" };
  }

  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        passwordHash: await hash(parsed.data.password, 12),
        roleId: parsed.data.roleId,
      },
      select: { id: true },
    });
    revalidatePath("/admin/users");
    return { id: user.id, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { id: null, error: "A user with this email already exists" };
    }
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: { name: string; email: string; password?: string; roleId: string }
) {
  await requirePermission("users", "update");
  const parsedId = z.string().min(1).safeParse(userId);
  const parsed = updateUserSchema.safeParse(data);
  if (!parsedId.success || !parsed.success) {
    return { success: false, error: parsed.success ? "Invalid user" : parsed.error.issues[0]?.message ?? "Invalid user details" };
  }
  if (!(await validateRole(parsed.data.roleId))) {
    return { success: false, error: "Selected role was not found" };
  }

  try {
    await prisma.user.update({
      where: { id: parsedId.data },
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        roleId: parsed.data.roleId,
        ...(parsed.data.password
          ? { passwordHash: await hash(parsed.data.password, 12) }
          : {}),
      },
    });
    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${parsedId.data}`);
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "A user with this email already exists" };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "User not found" };
    }
    throw error;
  }
}

export async function deleteUser(userId: string) {
  await requirePermission("users", "delete");
  const parsedId = z.string().min(1).safeParse(userId);
  if (!parsedId.success) return { success: false, error: "Invalid user" };

  const session = await auth();
  if (session?.user?.id === parsedId.data) {
    return { success: false, error: "You cannot delete your own account" };
  }

  try {
    const result = await prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({
        where: { id: parsedId.data },
        select: { id: true, role: { select: { name: true } } },
      });

      if (!user) {
        return { success: false as const, error: "User not found" };
      }

      if (user.role?.name === "Admin") {
        const activeAdminCount = await transaction.user.count({
          where: { isActive: true, role: { name: "Admin" } },
        });
        if (activeAdminCount <= 1) {
          return {
            success: false as const,
            code: "LAST_ADMIN" as const,
            error: "Please make at least one other user an active Admin before deleting this account.",
          };
        }
      }

      await transaction.user.delete({ where: { id: user.id } });
      return { success: true as const, error: null };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

    if (!result.success) return result;
    revalidatePath("/admin/users");
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return { success: false, error: "User not found" };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
      return {
        success: false,
        error: "The user list changed while deleting. Please try again.",
      };
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return {
        success: false,
        error: "This user has historical records and cannot be deleted. Deactivate the account instead.",
      };
    }
    throw error;
  }
}
