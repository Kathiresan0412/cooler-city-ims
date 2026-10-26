import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RequestForm } from "@/components/requests/request-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New Stock Request" };

export default async function NewRequestPage() {
  await requirePermission("requests", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New Request" description="Request stock from the warehouse" />
      <RequestForm />
    </div>
  );
}
