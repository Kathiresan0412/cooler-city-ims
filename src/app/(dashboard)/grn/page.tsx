import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Goods Received Notes" };

export default async function GRNListPage() {
  await requirePermission("grn", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Goods Received Notes" description="Record stock received from suppliers">
        <Button asChild>
          <Link href="/grn/new">
            <Plus className="mr-2 h-4 w-4" />
            New GRN
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: GRNTable */}
    </div>
  );
}
