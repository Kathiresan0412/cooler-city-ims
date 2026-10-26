"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SettingsForm() {
  return (
    <form className="space-y-4 rounded-lg border bg-card p-6">
      <div className="space-y-2">
        <Label htmlFor="shopName">Shop name</Label>
        <Input id="shopName" defaultValue="Cooler City IMS" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Input id="currency" defaultValue="LKR" />
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
