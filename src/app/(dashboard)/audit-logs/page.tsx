import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getActivityLog, getLoginHistory } from "@/server/queries/dashboard.queries";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LoginHistory } from "@/components/dashboard/login-history";

export const metadata: Metadata = { title: "Audit Logs" };

export default async function AuditLogsPage() {
  await requirePermission("audit_logs", "read");
  const [activity, loginHistory] = await Promise.all([
    getActivityLog(100),
    getLoginHistory(100),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity & Login History" description="Recent changes and sign-in attempts" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentActivity entries={activity} />
        <LoginHistory entries={loginHistory} />
      </div>
    </div>
  );
}
