"use server";

export async function createTransfer(data: Record<string, unknown>) {
  console.info("createTransfer stub", data);
  return { id: "stub-transfer-id", error: null };
}

export async function approveTransfer(_transferId: string) {
  return { success: true, error: null };
}

export async function dispatchTransfer(_transferId: string) {
  return { success: true, error: null };
}

export async function receiveTransfer(_transferId: string) {
  return { success: true, error: null };
}
