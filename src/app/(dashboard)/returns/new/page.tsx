import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Return" };

export default async function NewReturnPage() {
  await requirePermission("returns", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Return" description="Process a stock return" />
      {/* TODO: ReturnForm */}
    </div>
  );
}
