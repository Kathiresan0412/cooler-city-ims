import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requirePermission("notifications", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="System alerts and low-stock warnings" />
      {/* TODO: NotificationsList */}
    </div>
  );
}
