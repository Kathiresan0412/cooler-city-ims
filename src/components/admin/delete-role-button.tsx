"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteRole } from "@/server/actions/role.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DeleteRoleButtonProps {
  roleId: string;
  roleName: string;
  assignedUserCount: number;
}

export function DeleteRoleButton({
  roleId,
  roleName,
  assignedUserCount,
}: DeleteRoleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteRole(roleId);
      if (!result.success) {
        toast({ title: "Unable to delete role", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: "Role deleted" });
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ConfirmDialog
      title={`Delete ${roleName}?`}
      description={
        assignedUserCount > 0
          ? `This will permanently delete this role and its permissions. ${assignedUserCount} assigned user(s) will have no role until reassigned.`
          : "This will permanently delete this role and its permissions."
      }
      confirmLabel={isDeleting ? "Deleting..." : "Delete Role"}
      onConfirm={handleDelete}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          aria-label={`Delete ${roleName}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      }
    />
  );
}
