import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Manage your account settings" />
      {/* TODO: ProfileForm with password change */}
    </div>
  );
}
