import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Sales Report" };

export default async function SalesReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Sales Report" description="Sales and issue note history">
        <ExportButtons reportType="sales" />
      </PageHeader>
      {/* TODO: SalesReportTable */}
    </div>
  );
}
