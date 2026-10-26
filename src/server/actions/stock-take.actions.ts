"use server";

export async function createStockTake(data: Record<string, unknown>) {
  console.info("createStockTake stub", data);
  return { id: "stub-stock-take-id", error: null };
}
