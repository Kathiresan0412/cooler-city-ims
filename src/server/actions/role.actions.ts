"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

const createRoleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required").max(80),
  description: z.string().trim().max(500).optional(),
});

export async function createRole(data: { name: string; description?: string }) {
  await requirePermission("roles", "manage");

  const parsed = createRoleSchema.safeParse(data);
  if (!parsed.success) {
    return { id: null, error: parsed.error.issues[0]?.message ?? "Invalid role details" };
  }

  try {
    const role = await prisma.role.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
      },
      select: { id: true },
    });

    revalidatePath("/admin/roles");
    return { id: role.id, error: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { id: null, error: "A role with this name already exists" };
    }
    throw error;
  }
}

export async function deleteRole(roleId: string) {
  await requirePermission("roles", "manage");

  const parsed = z.string().min(1).safeParse(roleId);
  if (!parsed.success) {
    return { success: false, error: "Invalid role" };
  }

  const result = await prisma.$transaction(async (transaction) => {
    const role = await transaction.role.findUnique({
      where: { id: parsed.data },
      select: { id: true, isSystem: true },
    });

    if (!role) {
      return { success: false as const, error: "Role not found" };
    }
    if (role.isSystem) {
      return { success: false as const, error: "System roles cannot be deleted" };
    }

    await transaction.user.updateMany({
      where: { roleId: role.id },
      data: { roleId: null },
    });
    await transaction.role.delete({ where: { id: role.id } });
    return { success: true as const, error: null };
  });

  if (result.success) {
    revalidatePath("/admin/roles");
    revalidatePath("/admin/users");
  }
  return result;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  await requirePermission("roles", "manage");

  const parsed = z.object({
    roleId: z.string().min(1),
    permissionIds: z.array(z.string().min(1)),
  }).safeParse({ roleId, permissionIds });
  if (!parsed.success) {
    return { success: false, error: "Invalid role or permission selection" };
  }

  const uniquePermissionIds = [...new Set(parsed.data.permissionIds)];
  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId }, select: { id: true } }),
    prisma.permission.findMany({
      where: { id: { in: uniquePermissionIds } },
      select: { id: true },
    }),
  ]);

  if (!role) {
    return { success: false, error: "Role not found" };
  }
  if (permissions.length !== uniquePermissionIds.length) {
    return { success: false, error: "One or more selected permissions do not exist" };
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.rolePermission.deleteMany({ where: { roleId } });
    if (uniquePermissionIds.length > 0) {
      await transaction.rolePermission.createMany({
        data: uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })),
      });
    }
  });

  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${roleId}`);
  return { success: true, error: null };
}
