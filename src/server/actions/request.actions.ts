"use server";

import { requirePermission } from "@/lib/permissions";

export async function createRequest(data: Record<string, unknown>) {
  await requirePermission("requests", "create");
  console.info("createRequest stub", data);
  return { id: "stub-request-id", error: null };
}

export async function approveRequest(_requestId: string) {
  await requirePermission("requests", "approve");
  return { success: true, error: null };
}

export async function rejectRequest(_requestId: string) {
  await requirePermission("requests", "approve");
  return { success: true, error: null };
}

export async function issueRequest(_requestId: string) {
  await requirePermission("requests", "issue");
  return { success: true, error: null };
}
