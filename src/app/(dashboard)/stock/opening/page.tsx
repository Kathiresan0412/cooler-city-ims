import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Opening Stock" };

export default async function OpeningStockPage() {
  await requirePermission("stock", "open");

  return (
    <div className="space-y-6">
      <PageHeader title="Opening Stock" description="Set initial stock quantities for a location" />
      {/* TODO: OpeningStockForm */}
    </div>
  );
}
