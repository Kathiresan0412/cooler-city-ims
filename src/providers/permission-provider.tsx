"use client";

import * as React from "react";

type PermissionContextValue = {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
};

const PermissionContext = React.createContext<PermissionContextValue>({
  permissions: [],
  hasPermission: () => false,
});

export function PermissionProvider({
  children,
  permissions,
}: {
  children: React.ReactNode;
  permissions: string[];
}) {
  const value = React.useMemo<PermissionContextValue>(
    () => ({
      permissions,
      hasPermission: (permission) => permissions.includes(permission),
    }),
    [permissions]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext(): PermissionContextValue {
  return React.useContext(PermissionContext);
}
