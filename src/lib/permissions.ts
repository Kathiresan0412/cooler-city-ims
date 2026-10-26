import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function permissionKey(resource: string, action: string) {
  return `${resource}:${action}`;
}

export async function getUserPermissions(userId: string | undefined) {
  if (!userId) return [];

  const permissions = await prisma.rolePermission.findMany({
    where: {
      role: { users: { some: { id: userId, isActive: true } } },
    },
    select: {
      permission: { select: { resource: true, action: true } },
    },
  });

  return permissions.map(({ permission }) => permissionKey(permission.resource, permission.action));
}

export async function hasPermission(userId: string | undefined, resource: string, action: string) {
  if (!userId) return false;

  const permission = await prisma.rolePermission.findFirst({
    where: {
      role: { users: { some: { id: userId, isActive: true } } },
      permission: { resource, action },
    },
    select: { roleId: true },
  });

  return permission !== null;
}

export async function hasKitchenInventoryPermission(userId: string | undefined) {
  return hasPermission(userId, "kitchen_inventory", "manage");
}

export async function requirePermission(resource: string, action: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!(await hasPermission(session.user.id, resource, action))) redirect("/unauthorized");
}
