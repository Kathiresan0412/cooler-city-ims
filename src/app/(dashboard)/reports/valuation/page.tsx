import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Stock Valuation" };

export default async function ValuationReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Valuation" description="Inventory value at cost price">
        <ExportButtons reportType="valuation" />
      </PageHeader>
      {/* TODO: ValuationTable */}
    </div>
  );
}
