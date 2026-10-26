import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "GRN Detail" };

export default async function GRNDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("grn", "read");

  return (
    <div className="space-y-6">
      <PageHeader title={`GRN #${params.id}`} description="Goods received note detail" />
      {/* TODO: GRNDetail component */}
    </div>
  );
}
