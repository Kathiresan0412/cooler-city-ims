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
        imageUrl: true,
        category: { select: { name: true } },
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
        product: {
          select: {
            name: true,
            sku: true,
            category: { select: { name: true } },
            unit: { select: { abbreviation: true } },
          },
        },
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
      imageUrl: product.imageUrl,
      category: product.category?.name ?? null,
      unitAbbreviation: product.unit?.abbreviation ?? null,
      availableQuantity: Number(product.stockEntries[0]?.quantity ?? 0),
    })),
    users,
    warehouse: mainWarehouse,
    issues: issues.map((issue) => ({
      id: issue.id,
      productId: issue.productId,
      productName: issue.product.name,
      sku: issue.product.sku,
      category: issue.product.category?.name ?? null,
      unitAbbreviation: issue.product.unit?.abbreviation ?? null,
      locationName: issue.location.name,
      receiverName: issue.receiverName,
      issuedQuantity: Number(issue.issuedQuantity),
      returnedQuantity: Number(issue.returnedQuantity),
      remainingQuantity: issue.completedAt
        ? 0
        : Number(issue.issuedQuantity.sub(issue.returnedQuantity)),
      completedAt: issue.completedAt,
      notes: issue.notes,
      createdAt: issue.createdAt,
    })),
  };
}
