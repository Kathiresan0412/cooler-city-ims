import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { LowStockList } from "@/components/dashboard/low-stock-list";
import { MovementChart } from "@/components/dashboard/movement-chart";
import { StockByCategoryChart } from "@/components/dashboard/stock-by-category-chart";
import { TopMovingItems } from "@/components/dashboard/top-moving-items";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { getDashboardStats } from "@/server/queries/dashboard.queries";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your inventory" />
      <StatCards stats={stats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MovementChart />
        <StockByCategoryChart />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopMovingItems />
        </div>
        <LowStockList />
      </div>
      <RecentActivity />
    </div>
  );
}
