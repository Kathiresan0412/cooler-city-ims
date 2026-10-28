import { format, subDays, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";

const DAY_COUNT = 30;

export function getActivityLog(limit = 8) {
  return prisma.auditLog.findMany({
    where: { action: { not: "LOGIN" } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      resource: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
}

export function getLoginHistory(limit = 8) {
  return prisma.loginHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      successful: true,
      ipAddress: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });
}

export async function getDashboardOverview({ includeActivity = true } = {}) {
  const since = startOfDay(subDays(new Date(), DAY_COUNT - 1));
  const [products, pendingTransfers, ledgerEntries, activity, loginHistory] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        costPrice: true,
        reorderPoint: true,
        category: { select: { name: true } },
        stockEntries: { select: { quantity: true } },
      },
    }),
    prisma.transfer.count({
      where: { status: { in: ["PENDING_APPROVAL", "APPROVED", "DISPATCHED"] } },
    }),
    prisma.stockLedger.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
      select: {
        productId: true,
        quantityIn: true,
        quantityOut: true,
        createdAt: true,
        product: { select: { name: true, sku: true } },
      },
    }),
    includeActivity ? getActivityLog() : Promise.resolve([]),
    includeActivity ? getLoginHistory() : Promise.resolve([]),
  ]);

  const lowStock = products
    .map((product) => {
      const totalQty = product.stockEntries.reduce(
        (total, entry) => total + Number(entry.quantity),
        0,
      );
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalQty,
        reorderPoint: product.reorderPoint,
      };
    })
    .filter((product) => product.reorderPoint > 0 && product.totalQty <= product.reorderPoint)
    .sort((a, b) => a.totalQty - b.totalQty)
  const lowStockCount = lowStock.length;
  const lowStockItems = lowStock.slice(0, 10);

  const movementByDay = new Map<string, { inbound: number; outbound: number }>();
  const movingProducts = new Map<string, { name: string; sku: string; quantity: number }>();
  for (let offset = 0; offset < DAY_COUNT; offset += 1) {
    const date = startOfDay(subDays(new Date(), DAY_COUNT - 1 - offset));
    movementByDay.set(format(date, "yyyy-MM-dd"), { inbound: 0, outbound: 0 });
  }

  for (const entry of ledgerEntries) {
    const key = format(entry.createdAt, "yyyy-MM-dd");
    const day = movementByDay.get(key);
    const inbound = Number(entry.quantityIn);
    const outbound = Number(entry.quantityOut);
    if (day) {
      day.inbound += inbound;
      day.outbound += outbound;
    }

    const moving = movingProducts.get(entry.productId) ?? {
      name: entry.product.name,
      sku: entry.product.sku,
      quantity: 0,
    };
    moving.quantity += inbound + outbound;
    movingProducts.set(entry.productId, moving);
  }

  const categoryQuantities = new Map<string, number>();
  let totalStockValue = 0;
  for (const product of products) {
    const quantity = product.stockEntries.reduce(
      (total, entry) => total + Number(entry.quantity),
      0,
    );
    totalStockValue += quantity * Number(product.costPrice);
    const category = product.category?.name ?? "Uncategorized";
    categoryQuantities.set(category, (categoryQuantities.get(category) ?? 0) + quantity);
  }

  return {
    stats: {
      totalProducts: products.length,
      totalStockValue,
      pendingTransfers,
      lowStockItems: lowStockCount,
    },
    lowStock: lowStockItems,
    movement: Array.from(movementByDay, ([date, totals]) => ({ date, ...totals })),
    categories: Array.from(categoryQuantities, ([name, quantity]) => ({ name, quantity }))
      .filter((category) => category.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
    topMovingItems: Array.from(movingProducts, ([id, product]) => ({ id, ...product }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5),
    activity,
    loginHistory,
  };
}
