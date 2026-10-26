import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getLocationById } from "@/server/queries/stock.queries";

export const metadata: Metadata = { title: "Location Stock" };

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("stock", "read");
  const location = await getLocationById(id);
  if (!location) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={location.name} description={`Stock at ${location.name}`} />
      {/* TODO: LocationStockTable filtered to this location */}
    </div>
  );
}
