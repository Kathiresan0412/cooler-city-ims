"use server";

export async function createUser(data: Record<string, unknown>) {
  console.info("createUser stub", data);
  return { id: "stub-user-id", error: null };
}

export async function updateUser(_userId: string, data: Record<string, unknown>) {
  console.info("updateUser stub", _userId, data);
  return { success: true, error: null };
}
