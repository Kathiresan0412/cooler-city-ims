import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { getKitchenInventoryData } from "@/server/queries/kitchen-inventory.queries";
import { KitchenInventoryManager } from "@/components/stock/kitchen-inventory-manager";

export const metadata: Metadata = { title: "Kitchen Inventory" };
export const dynamic = "force-dynamic";

export default async function KitchenInventoryPage() {
  await requirePermission("stock", "read");
  const data = await getKitchenInventoryData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kitchen Inventory"
        description="Issue products from stock and record unused quantities returned from the kitchen."
      />
      <KitchenInventoryManager {...data} />
    </div>
  );
}
