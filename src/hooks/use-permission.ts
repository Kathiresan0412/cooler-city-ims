"use client";

import { usePermissionContext } from "@/providers/permission-provider";

export function usePermission(_resource?: string, _action?: string) {
  const { hasPermission } = usePermissionContext();

  return {
    can: (resourceName?: string, actionName?: string) =>
      Boolean(resourceName && actionName && hasPermission(`${resourceName}:${actionName}`)),
  };
}
