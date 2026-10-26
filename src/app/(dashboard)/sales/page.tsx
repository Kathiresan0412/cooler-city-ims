import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Sales" };

export default async function SalesPage() {
  await requirePermission("sales", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Sales" description="Issue notes and invoices">
        <Button asChild>
          <Link href="/sales/new">
            <Plus className="mr-2 h-4 w-4" />
            New Sale
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: SalesTable */}
    </div>
  );
}
