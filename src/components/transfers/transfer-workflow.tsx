"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { approveTransfer, dispatchTransfer, receiveTransfer } from "@/server/actions/transfer.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface TransferWorkflowProps {
  transferId: string;
  status?: string;
}

export function TransferWorkflow({ transferId, status = "DRAFT" }: TransferWorkflowProps) {
  const { toast } = useToast();
  const router = useRouter();

  async function handle(action: "approve" | "dispatch" | "receive") {
    const fn = action === "approve" ? approveTransfer : action === "dispatch" ? dispatchTransfer : receiveTransfer;
    const result = await fn(transferId);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `Transfer ${action}d successfully` });
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Status:</span>
        <StatusBadge status={status} />
      </div>
      <div className="flex gap-2">
        {status === "DRAFT" || status === "PENDING_APPROVAL" ? (
          <Button onClick={() => handle("approve")}>Approve</Button>
        ) : null}
        {status === "APPROVED" ? (
          <Button onClick={() => handle("dispatch")}>Mark Dispatched</Button>
        ) : null}
        {status === "DISPATCHED" ? (
          <Button onClick={() => handle("receive")}>Mark Received</Button>
        ) : null}
      </div>
    </div>
  );
}
