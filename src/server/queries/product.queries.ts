export async function getProducts() {
  return [
    {
      id: "prod-1",
      name: "Sample Product 1",
      sku: "SKU-1",
      barcode: "12345",
      description: "Sample product",
      categoryId: "cat-1",
      brandId: "brand-1",
      unitId: "unit-1",
      costPrice: 120,
      sellingPrice: 180,
      isActive: true,
      category: { name: "Electronics" },
      unit: { abbreviation: "pcs" },
      reorderPoint: 5,
      imageUrl: "",
      totalQty: 12,
    },
    {
      id: "prod-2",
      name: "Sample Product 2",
      sku: "SKU-2",
      barcode: "67890",
      description: "Another sample",
      categoryId: "cat-2",
      brandId: "brand-2",
      unitId: "unit-1",
      costPrice: 90,
      sellingPrice: 140,
      isActive: true,
      category: { name: "Accessories" },
      unit: { abbreviation: "box" },
      reorderPoint: 3,
      imageUrl: "",
      totalQty: 8,
    },
  ];
}

export async function getProductById(id: string) {
  return {
    id,
    name: `Sample Product ${id}`,
    sku: `SKU-${id}`,
    barcode: "12345",
    description: "Sample product",
    categoryId: "cat-1",
    brandId: "brand-1",
    unitId: "unit-1",
    costPrice: 120,
    sellingPrice: 180,
    isActive: true,
    category: { name: "Electronics" },
    unit: { abbreviation: "pcs" },
    reorderPoint: 5,
    imageUrl: "",
  };
}

export async function getCategories() {
  return [
    { id: "cat-1", name: "Electronics" },
    { id: "cat-2", name: "Accessories" },
  ];
}

export async function getBrands() {
  return [
    { id: "brand-1", name: "Brand A" },
    { id: "brand-2", name: "Brand B" },
  ];
}

export async function getUnits() {
  return [
    { id: "unit-1", name: "Piece", abbreviation: "pcs" },
    { id: "unit-2", name: "Box", abbreviation: "box" },
  ];
}
