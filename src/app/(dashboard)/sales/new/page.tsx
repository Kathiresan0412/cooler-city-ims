import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { SaleForm } from "@/components/sales/sale-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Sale" };

export default async function NewSalePage() {
  await requirePermission("sales", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Sale" description="Create an issue note or invoice" />
      <SaleForm />
    </div>
  );
}
