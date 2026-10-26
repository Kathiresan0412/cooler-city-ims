import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Adjustments Report" };

export default async function AdjustmentsReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Adjustments Report" description="Manual stock adjustment history">
        <ExportButtons reportType="adjustments" />
      </PageHeader>
      {/* TODO: AdjustmentsReportTable */}
    </div>
  );
}
