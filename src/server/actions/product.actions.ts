"use server";

export async function createProduct(data: Record<string, unknown>) {
  console.info("createProduct stub", data);
  return { id: "stub-product-id", error: null };
}

export async function updateProduct(_productId: string, data: Record<string, unknown>) {
  console.info("updateProduct stub", _productId, data);
  return { success: true, error: null };
}
