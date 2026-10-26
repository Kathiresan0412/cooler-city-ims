"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transferSchema, TransferInput } from "@/lib/validations/transfer.schema";
import { createTransfer } from "@/server/actions/transfer.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

export function TransferForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<TransferInput>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromLocationId: "",
      toLocationId: "",
      notes: "",
      items: [{ productId: "", quantity: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  async function onSubmit(data: TransferInput) {
    const result = await createTransfer(data);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Transfer created" });
      router.push(`/transfers/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>From Location *</Label>
          <Input placeholder="From location" {...form.register("fromLocationId")} />
        </div>
        <div className="space-y-2">
          <Label>To Location *</Label>
          <Input placeholder="To location" {...form.register("toLocationId")} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Notes</Label>
          <Input placeholder="Optional notes" {...form.register("notes")} />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Items</Label>
        {fields.map((field, i) => (
          <div key={field.id} className="flex items-end gap-2">
            <div className="flex-1">
              <Input placeholder="Product ID / SKU" {...form.register(`items.${i}.productId`)} />
            </div>
            <div className="w-28">
              <Input type="number" placeholder="Qty" {...form.register(`items.${i}.quantity`, { valueAsNumber: true })} />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", quantity: 0 })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Transfer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
