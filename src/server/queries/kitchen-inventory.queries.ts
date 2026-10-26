import { prisma } from "@/lib/prisma";

export async function getKitchenInventoryData() {
  const warehouse = await prisma.location.findUnique({
    where: { code: "WH-MAIN" },
    select: { id: true, name: true, isActive: true, isWarehouse: true },
  });
  const mainWarehouse = warehouse?.isActive && warehouse.isWarehouse
    ? { id: warehouse.id, name: warehouse.name }
    : null;
  const [products, issues, users] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        sku: true,
        unit: { select: { abbreviation: true } },
        stockEntries: {
          where: { location: { code: "WH-MAIN", isActive: true, isWarehouse: true } },
          select: { quantity: true },
        },
      },
    }),
    prisma.kitchenIssue.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true, sku: true, unit: { select: { abbreviation: true } } } },
        location: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      unitAbbreviation: product.unit?.abbreviation ?? null,
      availableQuantity: Number(product.stockEntries[0]?.quantity ?? 0),
    })),
    users,
    warehouse: mainWarehouse,
    issues: issues.map((issue) => ({
      id: issue.id,
      productName: issue.product.name,
      sku: issue.product.sku,
      unitAbbreviation: issue.product.unit?.abbreviation ?? null,
      locationName: issue.location.name,
      receiverName: issue.receiverName,
      issuedQuantity: Number(issue.issuedQuantity),
      returnedQuantity: Number(issue.returnedQuantity),
      remainingQuantity: Number(issue.issuedQuantity.sub(issue.returnedQuantity)),
      notes: issue.notes,
      createdAt: issue.createdAt,
    })),
  };
}
