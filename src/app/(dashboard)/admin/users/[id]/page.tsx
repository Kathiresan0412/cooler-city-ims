import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit User" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("users", "update");

  return (
    <div className="space-y-6">
      <PageHeader title="Edit User" description="Update user details and role" />
      <UserForm userId={id} />
    </div>
  );
}
