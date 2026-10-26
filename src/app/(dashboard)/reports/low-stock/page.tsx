import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Low Stock Report" };

export default async function LowStockReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Low Stock" description="Products at or below their reorder point">
        <ExportButtons reportType="low-stock" />
      </PageHeader>
      {/* TODO: LowStockTable */}
    </div>
  );
}
