import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Import Products" };

export default async function ImportProductsPage() {
  await requirePermission("products", "create");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Products"
        description="Upload a CSV or Excel file to bulk-import products"
      />
      {/* TODO: ImportProductsForm component */}
      <p className="text-muted-foreground">Import form coming soon.</p>
    </div>
  );
}
