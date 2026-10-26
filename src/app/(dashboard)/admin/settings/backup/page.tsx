import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Backup & Restore" };

export default async function BackupPage() {
  await requirePermission("settings", "manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Backup & Restore" description="Export or restore your database" />
      {/* TODO: BackupForm */}
    </div>
  );
}
