"use server";

export async function createPurchaseOrder(data: Record<string, unknown>) {
  console.info("createPurchaseOrder stub", data);
  return { id: "stub-po-id", error: null };
}
