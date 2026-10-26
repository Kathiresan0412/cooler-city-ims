"use server";

export async function createRole(data: Record<string, unknown>) {
  console.info("createRole stub", data);
  return { id: "stub-role-id", error: null };
}

export async function updateRolePermissions(_roleId: string, _permissions: string[]) {
  return { success: true, error: null };
}
