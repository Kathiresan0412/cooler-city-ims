"use client";

import { Button } from "@/components/ui/button";
import { approveRequest, issueRequest, rejectRequest } from "@/server/actions/request.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";

interface RequestApprovalProps {
  requestId: string;
  status?: string;
}

export function RequestApproval({ requestId, status = "PENDING" }: RequestApprovalProps) {
  const { toast } = useToast();
  const router = useRouter();

  async function handle(action: "approve" | "issue" | "reject") {
    const fn = action === "approve" ? approveRequest : action === "issue" ? issueRequest : rejectRequest;
    const result = await fn(requestId);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: `Request ${action}d` });
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
        {status === "PENDING" && (
          <>
            <Button onClick={() => handle("approve")}>Approve</Button>
            <Button variant="destructive" onClick={() => handle("reject")}>Reject</Button>
          </>
        )}
        {status === "APPROVED" && (
          <Button onClick={() => handle("issue")}>Issue Stock</Button>
        )}
      </div>
    </div>
  );
}
