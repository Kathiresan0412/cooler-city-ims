"use client";

export function usePermission(_resource?: string, _action?: string) {
  return {
    can: (_resourceName?: string, _actionName?: string) => true,
  };
}
