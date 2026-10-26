import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Units of Measure" };

export default async function UnitsPage() {
  await requirePermission("units", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Units of Measure" description="Define units used across products" />
      {/* TODO: UnitsTable + inline create/edit */}
    </div>
  );
}
