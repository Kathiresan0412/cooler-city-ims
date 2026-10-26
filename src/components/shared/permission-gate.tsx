"use client";

import { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";

interface PermissionGateProps {
  resource: string;
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function PermissionGate({ resource, action, children, fallback = null }: PermissionGateProps) {
  const { can } = usePermission();
  return can(resource, action) ? <>{children}</> : <>{fallback}</>;
}
