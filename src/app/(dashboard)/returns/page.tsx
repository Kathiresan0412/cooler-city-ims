import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Returns" };

export default async function ReturnsPage() {
  await requirePermission("returns", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Returns" description="Customer returns back into stock">
        <Button asChild>
          <Link href="/returns/new">
            <Plus className="mr-2 h-4 w-4" />
            New Return
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: ReturnsTable */}
    </div>
  );
}
