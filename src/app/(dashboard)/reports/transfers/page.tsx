import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Transfers Report" };

export default async function TransfersReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Transfers Report" description="Inter-location transfer history">
        <ExportButtons reportType="transfers" />
      </PageHeader>
      {/* TODO: TransfersReportTable */}
    </div>
  );
}
