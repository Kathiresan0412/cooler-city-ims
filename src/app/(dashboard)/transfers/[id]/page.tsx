import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { TransferWorkflow } from "@/components/transfers/transfer-workflow";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Transfer Detail" };

export default async function TransferDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("transfers", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Transfer Detail" description="Approve, dispatch, or receive this transfer" />
      <TransferWorkflow transferId={params.id} />
    </div>
  );
}
