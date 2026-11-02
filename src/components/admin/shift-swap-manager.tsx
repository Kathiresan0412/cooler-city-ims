"use client";

import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import type { ShiftSwapStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createShiftSwapRequest, respondToShiftSwap, reviewShiftSwap } from "@/server/actions/shift-swap.actions";
import { useRouter } from "next/navigation";

type SwapRequest = {
  id: string;
  requesterId: string;
  recipientId: string;
  requesterDate: string;
  recipientDate: string;
  note: string | null;
  status: ShiftSwapStatus;
  requester: { name: string | null; email: string };
  recipient: { name: string | null; email: string };
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

const statusLabels: Record<ShiftSwapStatus, string> = {
  WAITING_FOR_USER: "Waiting for coworker",
  WAITING_FOR_ADMIN: "Waiting for manager approval",
  APPROVED: "Approved",
  DECLINED: "Declined",
  REJECTED: "Rejected by manager",
};

export function ShiftSwapManager({
  currentUserId,
  users,
  requests,
  canApprove,
}: {
  currentUserId: string;
  users: { id: string; name: string | null; email: string }[];
  requests: SwapRequest[];
  canApprove: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSaving(true);
    try {
      const result = await createShiftSwapRequest({
        recipientId: String(values.get("recipientId") ?? ""),
        requesterDate: String(values.get("requesterDate") ?? ""),
        recipientDate: String(values.get("recipientDate") ?? ""),
        note: String(values.get("note") ?? ""),
      });
      if (!result.success) {
        toast({ title: "Could not send swap request", description: result.error, variant: "destructive" });
        return;
      }
      form.reset();
      toast({ title: "Swap request sent" });
      router.refresh();
    } catch {
      toast({ title: "Could not send swap request", description: "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function updateRequest(id: string, operation: () => Promise<{ success: boolean; error: string | null }>, successTitle: string) {
    setWorkingId(id);
    try {
      const result = await operation();
      if (!result.success) {
        toast({ title: "Could not update swap request", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: successTitle });
      router.refresh();
    } catch {
      toast({ title: "Could not update swap request", description: "Please try again.", variant: "destructive" });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section className="space-y-5 rounded-lg border bg-card p-5">
      <div>
        <h2 className="text-lg font-semibold">Shift swap requests</h2>
        <p className="text-sm text-muted-foreground">The other employee must accept before a manager approves and applies the swap.</p>
      </div>

      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="swap-recipient">Request swap with</Label>
          <select id="swap-recipient" name="recipientId" required disabled={saving || users.length < 2} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">Select employee</option>
            {users.filter((user) => user.id !== currentUserId).map((user) => (
              <option key={user.id} value={user.id}>{user.name || user.email}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="swap-requester-date">Your shift or leave date</Label>
          <Input id="swap-requester-date" name="requesterDate" type="date" required disabled={saving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="swap-recipient-date">Their shift or leave date</Label>
          <Input id="swap-recipient-date" name="recipientDate" type="date" required disabled={saving} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="swap-note">Note</Label>
          <Input id="swap-note" name="note" maxLength={250} placeholder="Add a note for your coworker" disabled={saving} />
        </div>
        <div className="sm:col-span-2 xl:col-span-4">
          <p className="mb-3 text-xs text-muted-foreground">
            We check both dates before sending. Morning and Night can be swapped, and one Leave date can trade with a work shift. Two Leave dates or identical assignments cannot be swapped.
          </p>
          <Button type="submit" disabled={saving || users.length < 2}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Send swap request
          </Button>
          {users.length < 2 && <p className="mt-2 text-sm text-muted-foreground">A second active employee is needed to request a swap.</p>}
        </div>
      </form>

      <div className="space-y-3 border-t pt-4">
        <h3 className="font-medium">Requests</h3>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No swap requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((request) => {
              const isRecipient = request.recipientId === currentUserId;
              const otherParty = isRecipient ? request.requester : request.recipient;
              return (
                <li key={request.id} className="space-y-3 rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {isRecipient ? `${otherParty.name || otherParty.email} requests a swap` : `Swap with ${otherParty.name || otherParty.email}`}
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        {request.requester.name || request.requester.email}: {formatDate(request.requesterDate)}
                        {" ↔ "}
                        {request.recipient.name || request.recipient.email}: {formatDate(request.recipientDate)}
                      </p>
                      {request.note && <p className="mt-1 text-muted-foreground">Note: {request.note}</p>}
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{statusLabels[request.status]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {isRecipient && request.status === "WAITING_FOR_USER" && (
                      <>
                        <Button size="sm" disabled={workingId === request.id} onClick={() => updateRequest(request.id, () => respondToShiftSwap(request.id, true), "Accepted; sent for manager approval")}>
                          {workingId === request.id && <Loader2 className="h-4 w-4 animate-spin" />}Accept
                        </Button>
                        <Button size="sm" variant="outline" disabled={workingId === request.id} onClick={() => updateRequest(request.id, () => respondToShiftSwap(request.id, false), "Swap request declined")}>
                          Decline
                        </Button>
                      </>
                    )}
                    {canApprove && request.status === "WAITING_FOR_ADMIN" && (
                      <>
                        <Button size="sm" disabled={workingId === request.id} onClick={() => updateRequest(request.id, () => reviewShiftSwap(request.id, true), "Swap approved and applied")}>
                          {workingId === request.id && <Loader2 className="h-4 w-4 animate-spin" />}Approve swap
                        </Button>
                        <Button size="sm" variant="outline" disabled={workingId === request.id} onClick={() => updateRequest(request.id, () => reviewShiftSwap(request.id, false), "Swap rejected")}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
