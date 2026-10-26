"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" />
      </div>
      <Button type="submit" className="w-full">Reset password</Button>
    </form>
  );
}
