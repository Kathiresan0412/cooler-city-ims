import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { Plus } from "lucide-react";

export const metadata: Metadata = { title: "Stock Requests" };

export default async function RequestsPage() {
  await requirePermission("requests", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Stock Requests" description="Kitchen and floor stock requests">
        <Button asChild>
          <Link href="/requests/new">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Link>
        </Button>
      </PageHeader>
      {/* TODO: RequestsTable */}
    </div>
  );
}
