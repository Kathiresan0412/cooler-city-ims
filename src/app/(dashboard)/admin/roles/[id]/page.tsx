import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { PermissionMatrix } from "@/components/admin/permission-matrix";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Edit Role" };

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("roles", "manage");
  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id },
      include: { permissions: { select: { permissionId: true } } },
    }),
    prisma.permission.findMany({
      orderBy: [{ resource: "asc" }, { action: "asc" }],
      select: { id: true, resource: true, action: true, label: true },
    }),
  ]);

  if (!role) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${role.name}`}
        description={role.description || "Update this role's permissions"}
      />
      <PermissionMatrix
        roleId={role.id}
        permissions={permissions}
        assignedIds={role.permissions.map(({ permissionId }) => permissionId)}
      />
    </div>
  );
}
