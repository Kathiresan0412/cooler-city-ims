"use server";

import { requirePermission } from "@/lib/permissions";

export async function createGRN(data: Record<string, unknown>) {
  await requirePermission("grn", "create");
  console.info("createGRN stub", data);
  return { id: "stub-grn-id", error: null };
}
