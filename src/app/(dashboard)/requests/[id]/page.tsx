import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { RequestApproval } from "@/components/requests/request-approval";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Request Detail" };

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("requests", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Request Detail" description="Review and action this stock request" />
      <RequestApproval requestId={id} />
    </div>
  );
}
