import { prisma } from "@/lib/prisma";

export async function hasKitchenInventoryPermission(userId: string | undefined) {
  if (!userId) return false;
  const permission = await prisma.rolePermission.findFirst({
    where: {
      role: { users: { some: { id: userId, isActive: true } } },
      permission: { resource: "kitchen_inventory", action: "manage" },
    },
    select: { roleId: true },
  });
  return permission !== null;
}

export function requirePermission(_resource: string, _action?: string) {
  return true;
}

export function usePermission(_resource?: string, _action?: string) {
  return {
    can: (_resourceName?: string, _actionName?: string) => true,
  };
}
