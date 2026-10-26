import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Stock Movements" };

export default async function MovementsReportPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Movements" description="All inbound and outbound movements">
        <ExportButtons reportType="movements" />
      </PageHeader>
      {/* TODO: MovementsTable with date range filter */}
    </div>
  );
}
