import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getCurrentStock } from "@/server/queries/stock.queries";
import { LocationStockTable } from "@/components/stock/location-stock-table";

export const metadata: Metadata = { title: "Current Stock" };

export default async function StockPage() {
  await requirePermission("stock", "read");
  const stock = await getCurrentStock();

  return (
    <div className="space-y-6">
      <PageHeader title="Current Stock" description="Stock levels across all locations" />
      <LocationStockTable data={stock} />
    </div>
  );
}
