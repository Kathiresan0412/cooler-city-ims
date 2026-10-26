import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { DeleteUserButton } from "@/components/admin/delete-user-button";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requirePermission("users", "read");
  const users = await prisma.user.findMany({
    orderBy: [{ name: "asc" }, { email: "asc" }],
    include: { role: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage system users">
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Link>
        </Button>
      </PageHeader>
      <div className="overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const displayName = user.name || user.email;
              return (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="font-medium hover:underline">
                      {displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.role?.name ?? "No role"}</td>
                  <td className="px-4 py-3">{user.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/users/${user.id}`}>Edit</Link>
                      </Button>
                      <DeleteUserButton userId={user.id} userName={displayName} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No users found. Create a user to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
