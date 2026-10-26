import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CameraScanner } from "@/components/barcode/camera-scanner";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Barcode Scanner" };

export default async function BarcodeScanPage() {
  await requirePermission("barcode", "scan");

  return (
    <div className="space-y-6">
      <PageHeader title="Barcode Scanner" description="Scan a barcode to look up a product" />
      <CameraScanner />
    </div>
  );
}
