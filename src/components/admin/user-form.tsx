"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser, updateUser } from "@/server/actions/user.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!userId;

  const form = useForm({
    defaultValues: { name: "", email: "", password: "", roleId: "" },
  });

  async function onSubmit() {
    const data = form.getValues();
    const result = isEdit ? await updateUser(userId!, data) : await createUser(data);
    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "User updated" : "User created" });
      router.push("/admin/users");
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input {...form.register("name")} />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input type="email" {...form.register("email")} />
      </div>
      {!isEdit && (
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" {...form.register("password")} />
        </div>
      )}
      <div className="space-y-2">
        <Label>Role</Label>
        <Input placeholder="Role ID" {...form.register("roleId")} />
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {isEdit ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
