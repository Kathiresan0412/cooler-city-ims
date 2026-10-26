import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Stock Take" };

export default async function StockTakePage() {
  await requirePermission("stock_take", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Take" description="Physical count and variance analysis">
        <Button asChild>
          <Link href="/stock-take/new">
            <Plus className="mr-2 h-4 w-4" />
            New Stock Take
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: StockTakeTable */}
    </div>
  );
}
