import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Transfers" };

export default async function TransfersPage() {
  await requirePermission("transfers", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Transfers" description="Move stock between locations">
        <Button asChild>
          <Link href="/transfers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: TransfersTable */}
    </div>
  );
}
