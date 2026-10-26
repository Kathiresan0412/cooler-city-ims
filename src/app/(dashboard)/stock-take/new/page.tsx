import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CountSheet } from "@/components/stock-take/count-sheet";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Stock Take" };

export default async function NewStockTakePage() {
  await requirePermission("stock_take", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Stock Take" description="Start a physical count for a location" />
      <CountSheet />
    </div>
  );
}
