import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Locations" };

export default async function LocationsPage() {
  await requirePermission("locations", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Locations" description="Warehouses and shop floors" />
      {/* TODO: LocationsTable */}
    </div>
  );
}
