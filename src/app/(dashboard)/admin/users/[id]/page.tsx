import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { UserForm } from "@/components/admin/user-form";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Edit User" };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("users", "update");
  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, roleId: true },
    }),
    prisma.role.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit User" description="Update user details and role" />
      <UserForm userId={id} roles={roles} initialUser={user} />
    </div>
  );
}
