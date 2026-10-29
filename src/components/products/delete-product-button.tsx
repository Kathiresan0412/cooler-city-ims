"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProduct } from "@/server/actions/product.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PermissionGate } from "@/components/shared/permission-gate";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const result = await deleteProduct(productId);
      if (!result.success) {
        toast({ title: "Product was not deleted", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: "Product deleted", description: `${productName} was removed successfully.` });
      router.push("/products");
      router.refresh();
    } catch {
      toast({
        title: "Product was not deleted",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <PermissionGate resource="products" action="delete">
      <ConfirmDialog
        title={`Delete ${productName}?`}
        description="Products with stock or inventory history cannot be deleted. If deletion is blocked, the message will explain what still uses this product."
        confirmLabel={isDeleting ? "Deleting..." : "Delete Product"}
        onConfirm={handleDelete}
        trigger={
          <Button type="button" variant="destructive" disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Product
          </Button>
        }
      />
    </PermissionGate>
  );
}
