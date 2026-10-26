import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New User" };

export default async function NewUserPage() {
  await requirePermission("users", "create");
  const roles = await prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div className="space-y-6">
      <PageHeader title="New User" description="Create a new system user" />
      <UserForm roles={roles} />
    </div>
  );
}
