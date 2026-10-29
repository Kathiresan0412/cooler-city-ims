import { format, subDays, startOfDay, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";

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

export async function getActivityLogPage(page: number, pageSize: number) {
  const where = { action: { not: "LOGIN" } };
  const total = await prisma.auditLog.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const entries = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      action: true,
      resource: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return { entries, total, page: currentPage, totalPages };
}

export async function getLoginHistoryPage(page: number, pageSize: number) {
  const total = await prisma.loginHistory.count();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const entries = await prisma.loginHistory.findMany({
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      email: true,
      successful: true,
      ipAddress: true,
      createdAt: true,
      user: { select: { name: true } },
    },
  });

  return { entries, total, page: currentPage, totalPages };
}

export async function getDashboardOverview({ includeActivity = true } = {}) {
  const now = new Date();
  const since = startOfDay(subDays(now, DAY_COUNT - 1));
  const monthSince = startOfMonth(now);
  const [products, ledgerEntries, activity, loginHistory] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        costPrice: true,
        reorderPoint: true,
        excludeFromLowStock: true,
        category: { select: { name: true } },
        stockEntries: { select: { quantity: true } },
      },
    }),
    prisma.stockLedger.findMany({
      where: { createdAt: { gte: monthSince < since ? monthSince : since } },
      orderBy: { createdAt: "asc" },
      select: {
        productId: true,
        movementType: true,
        quantityIn: true,
        quantityOut: true,
        createdAt: true,
        product: { select: { name: true, sku: true, unit: { select: { abbreviation: true } } } },
      },
    }),
    includeActivity ? getActivityLog(10) : Promise.resolve([]),
    includeActivity ? getLoginHistory(10) : Promise.resolve([]),
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
        reorderPoint: LOW_STOCK_THRESHOLD,
      };
    })
    .filter((product) => !product.excludeFromLowStock && product.totalQty <= LOW_STOCK_THRESHOLD)
    .sort((a, b) => a.totalQty - b.totalQty)
  const lowStockCount = lowStock.length;
  const lowStockItems = lowStock.slice(0, 10);

  const movementByDay = new Map<string, { inbound: number; outbound: number }>();
  const weekSince = startOfDay(subDays(new Date(), 6));
  const movingProducts = new Map<string, { name: string; sku: string; unit: string | null; week: number; month: number }>();
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

    // Transfers only relocate stock. Count sales and kitchen issues as stock used.
    if (!(["SALE_ISSUE", "KITCHEN_ISSUE"] as string[]).includes(entry.movementType)) continue;
    const moving = movingProducts.get(entry.productId) ?? {
      name: entry.product.name,
      sku: entry.product.sku,
      unit: entry.product.unit?.abbreviation ?? null,
      week: 0,
      month: 0,
    };
    if (entry.createdAt >= monthSince) moving.month += outbound;
    if (entry.createdAt >= weekSince) moving.week += outbound;
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
      lowStockItems: lowStockCount,
    },
    lowStock: lowStockItems,
    movement: Array.from(movementByDay, ([date, totals]) => ({ date, ...totals })),
    categories: Array.from(categoryQuantities, ([name, quantity]) => ({ name, quantity }))
      .filter((category) => category.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 6),
    topMovingItems: Array.from(movingProducts, ([id, product]) => ({ id, ...product }))
      .sort((a, b) => b.month - a.month)
      .slice(0, 5),
    activity,
    loginHistory,
  };
}
