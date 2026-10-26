import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { VarianceTable } from "@/components/stock-take/variance-table";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Stock Take Detail" };

export default async function StockTakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("stock_take", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Take" description="Count, variance and approval" />
      <VarianceTable stockTakeId={id} />
    </div>
  );
}
