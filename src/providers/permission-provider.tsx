"use client";

import * as React from "react";

type PermissionContextValue = {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
};

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function usePermissionContext(): PermissionContextValue {
  return {
    permissions: [],
    hasPermission: (_permission: string) => false,
  } as PermissionContextValue;
}
