import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PoForm } from "@/components/purchasing/po-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Purchase Order" };

export default async function NewPurchaseOrderPage() {
  await requirePermission("purchase_orders", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Purchase Order" description="Raise a new order with a supplier" />
      <PoForm />
    </div>
  );
}
