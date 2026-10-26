import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TransferForm } from "@/components/transfers/transfer-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Transfer" };

export default async function NewTransferPage() {
  await requirePermission("transfers", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Transfer" description="Initiate a stock transfer between locations" />
      <TransferForm />
    </div>
  );
}
