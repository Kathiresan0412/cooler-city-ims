import { prisma } from "@/lib/prisma";

export async function getLowStockProducts(limit = 10) {
  const products = await prisma.product.findMany({
    where: { isActive: true, reorderPoint: { gt: 0 } },
    include: { stockEntries: { select: { quantity: true } } },
  });

  return products
    .map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      totalQty: product.stockEntries.reduce((total, stock) => total + Number(stock.quantity), 0),
      reorderPoint: product.reorderPoint,
    }))
    .filter((product) => product.totalQty <= product.reorderPoint)
    .sort((a, b) => a.totalQty - b.totalQty)
    .slice(0, limit);
}

export async function getCurrentStock() {
  const [products, locations] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: { select: { name: true } },
        unit: { select: { abbreviation: true } },
        stockEntries: {
          select: { id: true, locationId: true, quantity: true, updatedAt: true, location: { select: { name: true } } },
        },
      },
    }),
    prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ isWarehouse: "desc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
  ]);

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category?.name ?? null,
      unitAbbreviation: product.unit?.abbreviation ?? null,
      totalQuantity: product.stockEntries.reduce((sum, entry) => sum + Number(entry.quantity), 0),
      stockUpdatedAt: product.stockEntries.reduce<Date | null>(
        (latest, entry) => !latest || entry.updatedAt > latest ? entry.updatedAt : latest,
        null,
      ),
      stockByLocation: product.stockEntries.map((entry) => ({
        locationId: entry.locationId,
        quantity: Number(entry.quantity),
      })),
    })),
    locations,
  };
}

export async function getLedger() {
  const entries = await prisma.stockLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { product: { select: { name: true, sku: true } } },
  });

  return entries.map((entry) => ({
    ...entry,
    quantityIn: Number(entry.quantityIn),
    quantityOut: Number(entry.quantityOut),
    balanceAfter: Number(entry.balanceAfter),
  }));
}

export async function getLocationById(id: string) {
  return prisma.location.findUnique({ where: { id }, select: { id: true, name: true } });
}

export async function getStockByProduct(productId: string) {
  const entries = await prisma.stock.findMany({
    where: { productId },
    include: {
      product: { select: { id: true, name: true, sku: true, reorderPoint: true } },
      location: { select: { name: true } },
    },
    orderBy: { location: { name: "asc" } },
  });

  return entries.map((entry) => ({ ...entry, quantity: Number(entry.quantity) }));
}
