import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RoleForm } from "@/components/admin/role-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Role" };

export default async function NewRolePage() {
  await requirePermission("roles", "manage");

  return (
    <div className="space-y-6">
      <PageHeader title="New Role" description="Create a role and assign permissions" />
      <RoleForm />
    </div>
  );
}
