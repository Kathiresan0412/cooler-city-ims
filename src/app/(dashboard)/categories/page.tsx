import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requirePermission("categories", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organise products into categories" />
      {/* TODO: CategoriesTable + inline create/edit */}
    </div>
  );
}
