import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getActivityLogPage, getLoginHistoryPage } from "@/server/queries/dashboard.queries";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LoginHistory } from "@/components/dashboard/login-history";
import { LogPagination } from "@/components/dashboard/log-pagination";

export const metadata: Metadata = { title: "Audit Logs" };

const PAGE_SIZE = 10;

function parsePage(value?: string) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ activityPage?: string; loginPage?: string }>;
}) {
  await requirePermission("audit_logs", "read");
  const params = await searchParams;
  const [activity, loginHistory] = await Promise.all([
    getActivityLogPage(parsePage(params.activityPage), PAGE_SIZE),
    getLoginHistoryPage(parsePage(params.loginPage), PAGE_SIZE),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity & Login History" description="Recent changes and sign-in attempts" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <RecentActivity entries={activity.entries} />
          <LogPagination
            page={activity.page}
            pageSize={PAGE_SIZE}
            total={activity.total}
            totalPages={activity.totalPages}
            pageParam="activityPage"
            otherPageParam="loginPage"
            otherPage={loginHistory.page}
          />
        </div>
        <div className="space-y-3">
          <LoginHistory entries={loginHistory.entries} />
          <LogPagination
            page={loginHistory.page}
            pageSize={PAGE_SIZE}
            total={loginHistory.total}
            totalPages={loginHistory.totalPages}
            pageParam="loginPage"
            otherPageParam="activityPage"
            otherPage={activity.page}
          />
        </div>
      </div>
    </div>
  );
}
