import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { LowStockList } from "@/components/dashboard/low-stock-list";
import { MovementChart } from "@/components/dashboard/movement-chart";
import { StockByCategoryChart } from "@/components/dashboard/stock-by-category-chart";
import { TopMovingItems } from "@/components/dashboard/top-moving-items";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getDashboardOverview } from "@/server/queries/dashboard.queries";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const permissions = await getUserPermissions(session?.user?.id);
  const canViewProducts = permissions.includes("products:read");
  const canViewStock = permissions.includes("stock:read");
  const canCreateProducts = permissions.includes("products:create");
  const canViewActivity = permissions.includes("audit_logs:read");
  const dashboard = await getDashboardOverview({ includeActivity: canViewActivity });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your inventory">
        {canViewStock && (
          <Button asChild variant="outline">
            <Link href="/stock">
              View stock <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {canCreateProducts && (
          <Button asChild>
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" /> Add product
            </Link>
          </Button>
        )}
      </PageHeader>
      <StatCards stats={dashboard.stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MovementChart data={dashboard.movement} />
        <StockByCategoryChart data={dashboard.categories} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopMovingItems items={dashboard.topMovingItems} canViewProducts={canViewProducts} canViewStock={canViewStock} />
        </div>
        <LowStockList items={dashboard.lowStock} canViewProducts={canViewProducts} canViewStock={canViewStock} />
      </div>
      {canViewActivity && <RecentActivity entries={dashboard.activity} />}
    </div>
  );
}
