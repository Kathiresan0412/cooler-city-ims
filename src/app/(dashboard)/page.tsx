import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { LowStockList } from "@/components/dashboard/low-stock-list";
import { MovementChart } from "@/components/dashboard/movement-chart";
import { StockByCategoryChart } from "@/components/dashboard/stock-by-category-chart";
import { TopMovingItems } from "@/components/dashboard/top-moving-items";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { LoginHistory } from "@/components/dashboard/login-history";
import { getDashboardOverview } from "@/server/queries/dashboard.queries";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getUserPermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { TodayShiftsDialog } from "@/components/dashboard/today-shifts-dialog";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const permissions = await getUserPermissions(session?.user?.id);
  const canViewProducts = permissions.includes("products:read");
  const canViewStock = permissions.includes("stock:read");
  const canCreateProducts = permissions.includes("products:create");
  const canViewActivity = permissions.includes("audit_logs:read");
  const canManageShifts = permissions.includes("shifts:manage");
  const dashboard = await getDashboardOverview({ includeActivity: canViewActivity });
  const today = new Date();
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);
  const todayDate = new Date(`${todayKey}T00:00:00.000Z`);
  const todayShifts = canManageShifts ? await prisma.user.findMany({
    where: { isActive: true, NOT: { role: { name: { contains: "admin", mode: "insensitive" } } } },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    include: {
      shiftSchedules: { orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }] },
      leaves: true,
      shiftDayOverrides: { where: { date: todayDate } },
      role: { select: { name: true } },
    },
  }) : [];
  const todayShiftRows = todayShifts.filter((user) => !(user.role?.name.toLowerCase().includes("admin"))).map((user) => {
    const override = user.shiftDayOverrides[0];
    const leave = override ? override.status === "LEAVE" : user.leaves.some((item) => {
      const startsOn = item.startsOn.toISOString().slice(0, 10);
      const endsOn = item.endsOn?.toISOString().slice(0, 10) ?? null;
      if (startsOn > todayKey || (endsOn && endsOn < todayKey)) return false;
      if (item.repeat === "ONCE") return startsOn <= todayKey;
      if (item.repeat === "DAILY") return true;
      return item.weekdays.includes(todayDate.getUTCDay());
    });
    const rule = user.shiftSchedules.filter((item) => {
      const startsOn = item.startsOn.toISOString().slice(0, 10);
      const endsOn = item.endsOn?.toISOString().slice(0, 10) ?? null;
      if (startsOn > todayKey || (endsOn && endsOn < todayKey)) return false;
      if (item.repeat === "ONCE") return startsOn === todayKey;
      if (item.repeat === "DAILY") return true;
      return item.weekdays.includes(todayDate.getUTCDay());
    }).at(-1);
    return { id: user.id, name: user.name || user.email, email: user.email, shift: leave ? null : override?.status === "WORK" ? override.shift ?? rule?.shift ?? user.defaultShift : rule?.shift ?? user.defaultShift };
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your inventory">
        {canManageShifts && <TodayShiftsDialog date={todayDate.toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })} shifts={todayShiftRows} />}
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
      {canViewActivity && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RecentActivity entries={dashboard.activity} />
          <LoginHistory entries={dashboard.loginHistory} />
        </div>
      )}
    </div>
  );
}
