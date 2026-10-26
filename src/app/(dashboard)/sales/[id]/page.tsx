import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Sale Detail" };

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("sales", "read");

  return (
    <div className="space-y-6">
      <PageHeader title={`Sale Detail ${id}`} description="Invoice / issue note" />
      {/* TODO: SaleDetail + InvoicePrint */}
    </div>
  );
}
