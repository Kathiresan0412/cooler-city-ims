"use server";

import { requirePermission } from "@/lib/permissions";

export async function createTransfer(data: Record<string, unknown>) {
  await requirePermission("transfers", "create");
  console.info("createTransfer stub", data);
  return { id: "stub-transfer-id", error: null };
}

export async function approveTransfer(_transferId: string) {
  await requirePermission("transfers", "approve");
  return { success: true, error: null };
}

export async function dispatchTransfer(_transferId: string) {
  await requirePermission("transfers", "dispatch");
  return { success: true, error: null };
}

export async function receiveTransfer(_transferId: string) {
  await requirePermission("transfers", "receive");
  return { success: true, error: null };
}
