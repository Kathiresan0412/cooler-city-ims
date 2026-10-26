import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Purchases Report" };

export default async function PurchasesReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Purchases Report" description="GRN and purchase order history">
        <ExportButtons reportType="purchases" />
      </PageHeader>
      {/* TODO: PurchasesReportTable */}
    </div>
  );
}
