"use server";

import { requirePermission } from "@/lib/permissions";

export async function createPurchaseOrder(data: Record<string, unknown>) {
  await requirePermission("purchase_orders", "create");
  console.info("createPurchaseOrder stub", data);
  return { id: "stub-po-id", error: null };
}
