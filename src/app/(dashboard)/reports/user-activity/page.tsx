import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ExportButtons } from "@/components/shared/export-buttons";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "User Activity Report" };

export default async function UserActivityReportPage() {
  await requirePermission("audit_logs", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="User Activity" description="Audit trail filtered by user and action">
        <ExportButtons reportType="user-activity" />
      </PageHeader>
      {/* TODO: UserActivityTable */}
    </div>
  );
}
