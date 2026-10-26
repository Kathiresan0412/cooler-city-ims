import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { hasKitchenInventoryPermission } from "@/lib/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const canManageKitchenInventory = await hasKitchenInventoryPermission(session.user.id);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar canManageKitchenInventory={canManageKitchenInventory} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar canManageKitchenInventory={canManageKitchenInventory} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
