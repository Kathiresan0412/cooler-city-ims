import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage() {
  await requirePermission("audit_logs", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="Full system audit trail" />
      {/* TODO: AuditLogsTable */}
    </div>
  );
}
