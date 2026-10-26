"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRole } from "@/server/actions/role.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function RoleForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    defaultValues: { name: "", description: "" },
  });

  async function onSubmit() {
    const result = await createRole(form.getValues());
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: "Role created" });
      router.push(`/admin/roles/${result.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>Role Name</Label>
        <Input {...form.register("name")} placeholder="e.g. Cashier" />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input {...form.register("description")} placeholder="Optional description" />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>Create Role</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
