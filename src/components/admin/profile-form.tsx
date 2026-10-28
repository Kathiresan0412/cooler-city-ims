"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { updateOwnProfile } from "@/server/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface ProfileFormProps {
  initialName: string;
  initialEmail: string;
}

export function ProfileForm({ initialName, initialEmail }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { toast } = useToast();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Enter the same new password in both fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await updateOwnProfile({ name, email, currentPassword, newPassword });
      if (!result.success) {
        toast({ title: "Unable to update profile", description: result.error, variant: "destructive" });
        return;
      }

      await updateSession();
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Profile updated", description: "Your account details have been saved." });
      router.refresh();
    } catch {
      toast({
        title: "Unable to update profile",
        description: "Something went wrong while saving your account details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Label htmlFor="profile-name">Full name</Label>
        <Input
          id="profile-name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={120}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="profile-email">Email address</Label>
        <Input
          id="profile-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          maxLength={255}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div>
          <h2 className="font-medium">Change password</h2>
          <p className="text-sm text-muted-foreground">
            Leave the new password fields blank to keep your current password.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type={showPasswords ? "text" : "password"}
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={8}
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type={showPasswords ? "text" : "password"}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            minLength={8}
            disabled={isSubmitting}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPasswords((visible) => !visible)}
          disabled={isSubmitting}
        >
          {showPasswords ? <EyeOff /> : <Eye />}
          {showPasswords ? "Hide passwords" : "Show passwords"}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          {isSubmitting ? "Saving..." : "Save changes"}
        </Button>
        <p className="text-xs text-muted-foreground">Confirm your current password to save changes.</p>
      </div>
    </form>
  );
}
