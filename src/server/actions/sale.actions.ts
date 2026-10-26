"use server";

export async function createSale(data: Record<string, unknown>) {
  console.info("createSale stub", data);
  return { id: "stub-sale-id", error: null };
}
