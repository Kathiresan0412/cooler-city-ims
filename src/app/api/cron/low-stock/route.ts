import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";

// Called by Vercel Cron — secured with a shared secret header
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find products at or below the shared low-stock threshold across all locations.
  const lowStockItems = await prisma.$queryRaw<
    { productId: string; name: string; totalQty: number; reorderPoint: number }[]
  >`
    SELECT p.id as "productId", p.name, ${LOW_STOCK_THRESHOLD} as "reorderPoint",
           COALESCE(SUM(s.quantity), 0)::float as "totalQty"
    FROM products p
    LEFT JOIN stock s ON s."productId" = p.id
    WHERE p."isActive" = true
    GROUP BY p.id, p.name
    HAVING COALESCE(SUM(s.quantity), 0) <= ${LOW_STOCK_THRESHOLD}
  `;

  if (lowStockItems.length === 0) {
    return NextResponse.json({ notified: 0 });
  }

  // Get admin users to notify
  const admins = await prisma.user.findMany({
    where: { isActive: true, role: { name: { in: ["Admin", "Manager"] } } },
    select: { id: true },
  });

  const notifications = lowStockItems.flatMap(
    (item: { productId: string; name: string; totalQty: number; reorderPoint: number }) =>
      admins.map((admin: { id: string }) => ({
        userId: admin.id,
        title: "Low Stock Alert",
        message: `${item.name} has ${item.totalQty} units remaining (reorder point: ${item.reorderPoint}).`,
        type: "LOW_STOCK",
        link: `/reports/low-stock`,
      }))
  );

  await prisma.notification.createMany({ data: notifications });

  return NextResponse.json({ notified: notifications.length });
}
