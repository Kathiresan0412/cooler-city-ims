import { prisma } from "@/lib/prisma";

export async function getKitchenInventoryData() {
  const [products, locations, issues] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: { select: { abbreviation: true } },
        stockEntries: { select: { locationId: true, quantity: true } },
      },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ isWarehouse: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.kitchenIssue.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true, unit: { select: { abbreviation: true } } } },
        location: { select: { name: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      unitAbbreviation: product.unit?.abbreviation ?? null,
      stockByLocation: product.stockEntries.map((entry) => ({
        locationId: entry.locationId,
        quantity: Number(entry.quantity),
      })),
    })),
    locations,
    issues: issues.map((issue) => ({
      id: issue.id,
      productName: issue.product.name,
      sku: issue.product.sku,
      unitAbbreviation: issue.product.unit?.abbreviation ?? null,
      locationName: issue.location.name,
      issuedQuantity: Number(issue.issuedQuantity),
      returnedQuantity: Number(issue.returnedQuantity),
      remainingQuantity: Number(issue.issuedQuantity.sub(issue.returnedQuantity)),
      notes: issue.notes,
      createdByName: issue.createdBy?.name ?? null,
      createdAt: issue.createdAt,
    })),
  };
}
