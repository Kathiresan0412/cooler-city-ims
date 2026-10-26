import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Roles" };

export default async function RolesPage() {
  await requirePermission("roles", "read");

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
      {/* TODO: RolesTable */}
    </div>
  );
}
