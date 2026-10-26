"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteUser } from "@/server/actions/user.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function DeleteUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteUser(userId);
      if (!result.success) {
        toast({
          title: "code" in result && result.code === "LAST_ADMIN"
            ? "Cannot delete the last Admin"
            : "Unable to delete user",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "User deleted" });
      router.refresh();
    } catch {
      toast({
        title: "Unable to delete user",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      title={`Delete ${userName}?`}
      description="This permanently removes the user account. Users with historical records cannot be deleted."
      confirmLabel={isDeleting ? "Deleting..." : "Delete User"}
      onConfirm={handleDelete}
      trigger={
        <Button type="button" variant="ghost" size="icon" disabled={isDeleting} aria-label={`Delete ${userName}`}>
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
        </Button>
      }
    />
  );
}
