import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Stock Report" };

export default async function StockReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Report" description="Current stock levels by product and location">
        <ExportButtons reportType="stock" />
      </PageHeader>
      {/* TODO: StockReportTable */}
    </div>
  );
}
