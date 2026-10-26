import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { hasKitchenInventoryPermission } from "@/lib/permissions";
import { getKitchenInventoryData } from "@/server/queries/kitchen-inventory.queries";
import { KitchenInventoryManager } from "@/components/stock/kitchen-inventory-manager";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Kitchen Inventory" };
export const dynamic = "force-dynamic";

export default async function KitchenInventoryPage() {
  const session = await auth();
  if (!(await hasKitchenInventoryPermission(session?.user?.id))) redirect("/unauthorized");
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
