import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getCurrentStock } from "@/server/queries/stock.queries";
import { CurrentStockManager } from "@/components/stock/current-stock-manager";

export const metadata: Metadata = { title: "Current Stock" };

export default async function StockPage() {
  await requirePermission("stock", "read");
  const { products, locations } = await getCurrentStock();

  return (
    <div className="space-y-6">
      <PageHeader title="Current Stock" description="Manage product quantities across locations" />
      <CurrentStockManager products={products} locations={locations} />
    </div>
  );
}
