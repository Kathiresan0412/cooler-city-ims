import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { AdjustmentForm } from "@/components/stock/adjustment-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Stock Adjustment" };

export default async function NewAdjustmentPage() {
  await requirePermission("stock", "adjust");

  return (
    <div className="space-y-6">
      <PageHeader title="New Adjustment" description="Add or remove stock manually" />
      <AdjustmentForm />
    </div>
  );
}
