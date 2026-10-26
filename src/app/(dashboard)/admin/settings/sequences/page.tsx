import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Document Sequences" };

export default async function SequencesPage() {
  await requirePermission("settings", "manage");

  return (
    <div className="space-y-6">
      <PageHeader title="Document Sequences" description="Configure numbering for GRN, PO, Sale, etc." />
      {/* TODO: SequencesForm */}
    </div>
  );
}
