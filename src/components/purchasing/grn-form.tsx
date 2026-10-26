"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { grnSchema, GRNInput } from "@/lib/validations/purchase.schema";
import { createGRN } from "@/server/actions/grn.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

export function GrnForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<GRNInput>({
    resolver: zodResolver(grnSchema),
    defaultValues: {
      notes: "",
      items: [{ productId: "", locationId: "", quantity: 0, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  async function onSubmit(data: GRNInput) {
    const result = await createGRN(data);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "GRN created" });
      router.push(`/grn/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Label>Notes</Label>
        <Input placeholder="Optional notes" {...form.register("notes")} />
      </div>

      <div className="space-y-3">
        <Label>Items Received</Label>
        {fields.map((field, i) => (
          <div key={field.id} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Input placeholder="Product / SKU" {...form.register(`items.${i}.productId`)} />
            <Input placeholder="Location" {...form.register(`items.${i}.locationId`)} />
            <Input type="number" placeholder="Qty" {...form.register(`items.${i}.quantity`, { valueAsNumber: true })} />
            <div className="flex gap-2">
              <Input type="number" placeholder="Unit cost" {...form.register(`items.${i}.unitCost`, { valueAsNumber: true })} />
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: "", locationId: "", quantity: 0, unitCost: 0 })}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Create GRN"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
