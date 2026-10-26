"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, updateUser } from "@/server/actions/user.actions";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface UserFormProps {
  userId?: string;
  roles: { id: string; name: string }[];
  initialUser?: { name: string | null; email: string; roleId: string | null };
}

interface UserFormValues {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export function UserForm({ userId, roles, initialUser }: UserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!userId;
  const form = useForm<UserFormValues>({
    defaultValues: {
      name: initialUser?.name ?? "",
      email: initialUser?.email ?? "",
      password: "",
      roleId: initialUser?.roleId ?? "",
    },
  });
  const selectedRoleId = form.watch("roleId");

  async function onSubmit(values: UserFormValues) {
    if (!values.roleId) {
      form.setError("roleId", { type: "required", message: "Role is required" });
      return;
    }

    try {
      const result = isEdit
        ? await updateUser(userId, {
            ...values,
          })
        : await createUser({
            ...values,
          });

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }

      toast({ title: isEdit ? "User updated" : "User created" });
      router.push("/admin/users");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Could not save the user. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-name">Full Name</Label>
        <Input id="user-name" autoComplete="name" disabled={form.formState.isSubmitting} {...form.register("name", { required: "Name is required" })} />
        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input id="user-email" type="email" autoComplete="email" disabled={form.formState.isSubmitting} {...form.register("email", { required: "Email is required" })} />
        {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-password">{isEdit ? "Set New Password (optional)" : "Password"}</Label>
        <div className="relative">
          <Input
            id="user-password"
            type={showPassword ? "text" : "password"}
            autoComplete={isEdit ? "new-password" : "new-password"}
            placeholder={isEdit ? "Leave blank to keep the current password" : "At least 8 characters"}
            disabled={form.formState.isSubmitting}
            {...form.register("password", {
              required: isEdit ? false : "Password is required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
            })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide new password" : "Show new password"}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </Button>
        </div>
        {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
        <p className="text-xs text-muted-foreground">
          Passwords are stored securely and cannot be viewed after they are set.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <Select
          value={selectedRoleId || undefined}
          onValueChange={(value) => {
            form.setValue("roleId", value, { shouldDirty: true, shouldValidate: true });
            form.clearErrors("roleId");
          }}
          disabled={form.formState.isSubmitting}
        >
          <SelectTrigger id="user-role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.roleId && <p className="text-sm text-destructive">{form.formState.errors.roleId.message}</p>}
        {roles.length === 0 && <p className="text-xs text-destructive">Create a role before adding or editing users.</p>}
      </div>
      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting || roles.length === 0}>
          {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={form.formState.isSubmitting}>Cancel</Button>
      </div>
    </form>
  );
}
