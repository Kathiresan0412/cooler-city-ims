"use server";

export async function createRequest(data: Record<string, unknown>) {
  console.info("createRequest stub", data);
  return { id: "stub-request-id", error: null };
}

export async function approveRequest(_requestId: string) {
  return { success: true, error: null };
}

export async function rejectRequest(_requestId: string) {
  return { success: true, error: null };
}

export async function issueRequest(_requestId: string) {
  return { success: true, error: null };
}
