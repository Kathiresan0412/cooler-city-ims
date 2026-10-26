import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { LabelSheetPrint } from "@/components/barcode/label-sheet-print";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Barcode Labels" };

export default async function BarcodePage() {
  await requirePermission("barcode", "print");

  return (
    <div className="space-y-6">
      <PageHeader title="Barcode Labels" description="Generate and print barcode label sheets" />
      <LabelSheetPrint />
    </div>
  );
}
