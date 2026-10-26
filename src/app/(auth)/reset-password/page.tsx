import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-muted-foreground">
          Choose a strong password for your account.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}
