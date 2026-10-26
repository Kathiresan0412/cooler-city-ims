import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage() {
  await requirePermission("brands", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Brands" description="Manage product brands" />
      {/* TODO: BrandsTable + inline create/edit */}
    </div>
  );
}
