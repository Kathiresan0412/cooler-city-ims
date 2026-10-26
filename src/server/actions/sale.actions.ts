"use server";

import { requirePermission } from "@/lib/permissions";

export async function createSale(data: Record<string, unknown>) {
  await requirePermission("sales", "create");
  console.info("createSale stub", data);
  return { id: "stub-sale-id", error: null };
}
