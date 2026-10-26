import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { GrnForm } from "@/components/purchasing/grn-form";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "New GRN" };

export default async function NewGRNPage() {
  await requirePermission("grn", "create");

  return (
    <div className="space-y-6">
      <PageHeader title="New GRN" description="Record goods received into stock" />
      <GrnForm />
    </div>
  );
}
