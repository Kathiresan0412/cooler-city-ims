import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ShiftScheduleManager } from "@/components/admin/shift-schedule-manager";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Shift Schedule" };

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseWeekDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date();
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && dateKey(date) === value ? date : new Date();
}

function startOfWeek(date: Date) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

function shiftLabel(shift: string) {
  return shift === "NINE_TO_SIX" ? "Morning · 9:00 AM–6:00 PM" : "Night · 2:00 PM–11:00 PM";
}

function dateLabel(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function ShiftSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  await requirePermission("shifts", "manage");
  const params = await searchParams;
  const weekStart = startOfWeek(parseWeekDate(params.week));
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const users = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    include: {
      shiftSchedules: {
        where: { startsOn: { lte: weekEnd } },
        orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }],
      },
      leaves: {
        where: { startsOn: { lte: weekEnd } },
        orderBy: [{ startsOn: "asc" }],
      },
    },
  });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + index);
    return date;
  });
  const previousWeek = new Date(weekStart);
  previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const managerUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    defaultShift: user.defaultShift,
    shiftSchedules: user.shiftSchedules.map((rule) => ({
      id: rule.id,
      shift: rule.shift,
      startsOn: dateKey(rule.startsOn),
      endsOn: rule.endsOn ? dateKey(rule.endsOn) : null,
      repeat: rule.repeat,
      weekdays: rule.weekdays,
    })),
    leaves: user.leaves.map((leave) => ({
      id: leave.id,
      startsOn: dateKey(leave.startsOn),
      endsOn: dateKey(leave.endsOn),
      reason: leave.reason,
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Shift Schedule" description="Set employee shifts, recurring schedules, and leave">
        <Button asChild variant="outline">
          <Link href="/admin/users">Manage users</Link>
        </Button>
      </PageHeader>

      <section className="space-y-4 rounded-lg border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Weekly schedule</h2>
            <p className="text-sm text-muted-foreground">
              {dateLabel(weekStart)} - {dateLabel(weekEnd)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/schedule?week=${dateKey(previousWeek)}`}>Previous week</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/schedule?week=${dateKey(nextWeek)}`}>Next week</Link>
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b">
                <th className="w-12 px-3 py-3 text-left font-medium">No.</th>
                <th className="px-3 py-3 text-left font-medium">User</th>
                {weekDays.map((date) => (
                  <th key={dateKey(date)} className="px-3 py-3 text-left font-medium">{dateLabel(date)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, userIndex) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-3 py-3 text-muted-foreground">{userIndex + 1}</td>
                  <th className="px-3 py-3 text-left font-medium">{user.name || user.email}</th>
                  {weekDays.map((date) => {
                    const key = dateKey(date);
                    const leave = user.leaves.find((item) =>
                      dateKey(item.startsOn) <= key && dateKey(item.endsOn) >= key
                    );
                    const matchingRule = user.shiftSchedules
                      .filter((rule) => {
                        const startsOn = dateKey(rule.startsOn);
                        const endsOn = rule.endsOn ? dateKey(rule.endsOn) : null;
                        if (startsOn > key || (endsOn && endsOn < key)) return false;
                        if (rule.repeat === "ONCE") return startsOn === key;
                        if (rule.repeat === "DAILY") return true;
                        return rule.weekdays.includes(date.getUTCDay());
                      })
                      .at(-1);
                    return (
                      <td key={key} className="px-3 py-3">
                        {leave ? (
                          <span className="inline-flex min-w-20 justify-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Leave</span>
                        ) : (
                          <span className="inline-flex min-w-20 justify-center rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-900">
                            {shiftLabel(matchingRule?.shift ?? user.defaultShift).split(" · ")[0]}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">No active users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Morning is 9:00 AM–6:00 PM; Night is 2:00 PM–11:00 PM. Date-specific rules override each user’s default shift. Leave takes precedence over any shift.
        </p>
      </section>

      <ShiftScheduleManager users={managerUsers} />
    </div>
  );
}
