export async function getLowStockProducts(limit = 10) {
  return Array.from({ length: Math.min(limit, 5) }, (_, index) => ({
    id: `product-${index + 1}`,
    name: `Sample product ${index + 1}`,
    sku: `SKU-${index + 1}`,
    totalQty: 2 + index,
  }));
}

export async function getCurrentStock() {
  return [
    {
      id: "stock-1",
      product: { id: "prod-1", name: "Sample product 1", sku: "SKU-1", reorderPoint: 3 },
      location: { name: "Main Warehouse" },
      quantity: 4,
    },
    {
      id: "stock-2",
      product: { id: "prod-2", name: "Sample product 2", sku: "SKU-2", reorderPoint: 5 },
      location: { name: "Store Front" },
      quantity: 8,
    },
  ];
}

export async function getLedger() {
  return [
    {
      id: "ledger-1",
      productId: "prod-1",
      product: { name: "Sample product 1", sku: "SKU-1" },
      locationId: "loc-1",
      movementType: "IN",
      quantityIn: 5,
      quantityOut: 0,
      balanceAfter: 12,
      referenceType: "GRN",
      referenceId: "grn-1",
      createdAt: new Date("2024-01-10T00:00:00Z"),
    },
    {
      id: "ledger-2",
      productId: "prod-2",
      product: { name: "Sample product 2", sku: "SKU-2" },
      locationId: "loc-2",
      movementType: "OUT",
      quantityIn: 0,
      quantityOut: 2,
      balanceAfter: 8,
      referenceType: "SALE",
      referenceId: "sale-1",
      createdAt: new Date("2024-01-11T00:00:00Z"),
    },
  ];
}

export async function getLocationById(id: string) {
  return {
    id,
    name: `Location ${id}`,
  };
}

export async function getStockByProduct(productId: string) {
  return [
    {
      id: "stock-product-1",
      product: { id: productId, name: "Sample Product", sku: "SKU-1", reorderPoint: 3 },
      location: { name: "Main Warehouse" },
      quantity: 12,
    },
    {
      id: "stock-product-2",
      product: { id: productId, name: "Sample Product", sku: "SKU-1", reorderPoint: 3 },
      location: { name: "Store Front" },
      quantity: 5,
    },
  ];
}
