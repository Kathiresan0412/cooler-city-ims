"use server";

import { requirePermission } from "@/lib/permissions";

export async function createStockTake(data: Record<string, unknown>) {
  await requirePermission("stock_take", "create");
  console.info("createStockTake stub", data);
  return { id: "stub-stock-take-id", error: null };
}
