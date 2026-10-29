import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteRoleButton } from "@/components/admin/delete-role-button";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  await requirePermission("roles", "read");
  const roles = await prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { users: true, permissions: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Manage roles and their permissions">
        <Button asChild>
          <Link href="/admin/roles/new">
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Link>
        </Button>
      </PageHeader>
      <div className="hidden overflow-hidden rounded-md border md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Permissions</th>
              <th className="px-4 py-3 text-left font-medium">Users</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/roles/${role.id}`} className="font-medium hover:underline">
                    {role.name}
                  </Link>
                  {role.description && (
                    <p className="mt-1 text-muted-foreground">{role.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">{role._count.permissions}</td>
                <td className="px-4 py-3">{role._count.users}</td>
                <td className="px-4 py-3">{role.isSystem ? "System" : "Custom"}</td>
                <td className="px-4 py-3 text-right">
                  {!role.isSystem && (
                    <DeleteRoleButton
                      roleId={role.id}
                      roleName={role.name}
                      assignedUserCount={role._count.users}
                    />
                  )}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No roles found. Create a role to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 md:hidden">
        {roles.map((role) => (
          <article key={role.id} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
            <div>
              <Link href={`/admin/roles/${role.id}`} className="font-semibold hover:underline">{role.name}</Link>
              {role.description && <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>}
            </div>
            <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-sm">
              <div><strong className="block">{role._count.permissions}</strong><span className="text-xs text-muted-foreground">Permissions</span></div>
              <div><strong className="block">{role._count.users}</strong><span className="text-xs text-muted-foreground">Users</span></div>
              <div><strong className="block">{role.isSystem ? "System" : "Custom"}</strong><span className="text-xs text-muted-foreground">Type</span></div>
            </div>
            {!role.isSystem && <div className="flex justify-end border-t pt-2"><DeleteRoleButton roleId={role.id} roleName={role.name} assignedUserCount={role._count.users} /></div>}
          </article>
        ))}
        {roles.length === 0 && <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">No roles found. Create a role to get started.</p>}
      </div>
    </div>
  );
}
