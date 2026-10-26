import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Edit Role" };

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("roles", "manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Role" description="Update this role's permission matrix" />
      <PermissionMatrix roleId={id} />
    </div>
  );
}
