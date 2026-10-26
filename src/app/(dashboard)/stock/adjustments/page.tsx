import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Stock Adjustments" };

export default async function StockAdjustmentsPage() {
  await requirePermission("stock", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Adjustments" description="Manual corrections to stock levels">
        <Button asChild>
          <Link href="/stock/adjustments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Adjustment
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: AdjustmentsTable */}
    </div>
  );
}
