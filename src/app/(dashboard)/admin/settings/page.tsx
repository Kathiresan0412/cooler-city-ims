import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePermission("settings", "manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Shop info, currency, tax and preferences" />
      <SettingsForm />
    </div>
  );
}
