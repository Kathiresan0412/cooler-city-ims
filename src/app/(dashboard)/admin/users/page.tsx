import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Users" };

export default async function UsersPage() {
  await requirePermission("users", "read");

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
      {/* TODO: UsersTable */}
    </div>
  );
}
