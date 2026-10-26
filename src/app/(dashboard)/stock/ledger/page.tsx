import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getLedger } from "@/server/queries/stock.queries";
import { LedgerTable } from "@/components/stock/ledger-table";

export const metadata: Metadata = { title: "Stock Ledger" };

export default async function LedgerPage() {
  await requirePermission("stock", "read");
  const ledger = await getLedger();

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Ledger" description="Full movement history" />
      <LedgerTable data={ledger} />
    </div>
  );
}
