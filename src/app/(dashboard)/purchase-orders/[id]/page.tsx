import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Purchase Order Detail" };

export default async function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("purchase_orders", "read");

  return (
    <div className="space-y-6">
      <PageHeader title={`PO Detail ${id}`} description="View and receive against this purchase order" />
      {/* TODO: PODetail with partial receiving */}
    </div>
  );
}
