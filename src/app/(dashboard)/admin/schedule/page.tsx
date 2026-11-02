import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { ShiftScheduleManager } from "@/components/admin/shift-schedule-manager";
import { ShiftSwapManager } from "@/components/admin/shift-swap-manager";
import { hasPermission } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

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
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const canManageShifts = await hasPermission(session.user.id, "shifts", "manage");
  const params = await searchParams;
  const weekStart = startOfWeek(parseWeekDate(params.week));
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const users = await prisma.user.findMany({
    where: canManageShifts
      ? {
          isActive: true,
          NOT: { role: { name: { contains: "admin", mode: "insensitive" } } },
        }
      : { id: session.user.id, isActive: true },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    include: {
      shiftSchedules: {
        orderBy: [{ startsOn: "asc" }, { createdAt: "asc" }],
      },
      leaves: {
        orderBy: [{ startsOn: "asc" }],
      },
      shiftDayOverrides: {
        where: { date: { gte: weekStart, lte: weekEnd } },
      },
      role: { select: { name: true } },
    },
  });

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setUTCDate(date.getUTCDate() + index);
    return date;
  });
  const scheduleRows = users.map((user, userIndex) => ({
    user,
    userIndex,
    days: weekDays.map((date) => {
      const key = dateKey(date);
      const override = user.shiftDayOverrides.find((item) => dateKey(item.date) === key);
      const leave = override
        ? override.status === "LEAVE"
        : user.leaves.some((item) => {
        const startsOn = dateKey(item.startsOn);
        const endsOn = item.endsOn ? dateKey(item.endsOn) : null;
        if (startsOn > key || (endsOn && endsOn < key)) return false;
        if (item.repeat === "ONCE") return startsOn <= key;
        if (item.repeat === "DAILY") return true;
        return item.weekdays.includes(date.getUTCDay());
      });
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
      return {
        date,
        key,
        leave: Boolean(leave),
        shift: override?.status === "WORK" ? override.shift ?? matchingRule?.shift ?? user.defaultShift : matchingRule?.shift ?? user.defaultShift,
      };
    }),
  }));
  const previousWeek = new Date(weekStart);
  previousWeek.setUTCDate(previousWeek.getUTCDate() - 7);
  const nextWeek = new Date(weekStart);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);

  const managerUsers = users
    .filter((user) => {
      const roleName = user.role?.name.toLowerCase() ?? "";
      return !roleName.includes("admit");
    })
    .map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    defaultShift: user.defaultShift,
    shiftSchedules: user.shiftSchedules.map((rule) => ({
      id: rule.id,
      updatedAt: (rule.updatedAt ?? rule.createdAt).toISOString(),
      shift: rule.shift,
      startsOn: dateKey(rule.startsOn),
      endsOn: rule.endsOn ? dateKey(rule.endsOn) : null,
      repeat: rule.repeat,
      weekdays: rule.weekdays,
    })),
    leaves: user.leaves.map((leave) => ({
      id: leave.id,
      updatedAt: (leave.updatedAt ?? leave.createdAt).toISOString(),
      startsOn: dateKey(leave.startsOn),
      endsOn: leave.endsOn ? dateKey(leave.endsOn) : null,
      repeat: leave.repeat,
      weekdays: leave.weekdays,
      reason: leave.reason,
    })),
    }));
  const [swapUsers, swapRequests] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }, { email: "asc" }],
      select: { id: true, name: true, email: true },
    }),
    prisma.shiftSwapRequest.findMany({
      where: canManageShifts
        ? { OR: [{ status: "WAITING_FOR_ADMIN" }, { requesterId: session.user.id }, { recipientId: session.user.id }] }
        : { OR: [{ requesterId: session.user.id }, { recipientId: session.user.id }] },
      include: {
        requester: { select: { name: true, email: true } },
        recipient: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shift Schedule"
        description={canManageShifts ? "View and manage employee shifts, recurring schedules, and leave" : "View your weekly shifts and leave"}
      >
        {canManageShifts && (
          <Button asChild variant="outline">
            <Link href="/admin/users">Manage users</Link>
          </Button>
        )}
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
        <div className="space-y-3 md:hidden">
          {scheduleRows.map(({ user, userIndex, days }) => (
            <article key={user.id} className="rounded-lg border bg-background p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3 border-b pb-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  {userIndex + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{user.name || user.email}</h3>
                  {user.name && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {days.map(({ date, key, leave, shift }) => (
                  <div key={key} className="flex min-h-12 items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2">
                    <span className="min-w-0 text-sm font-medium text-foreground">
                      {new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(date)}
                    </span>
                    {leave ? (
                      <span className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Leave</span>
                    ) : (
                      <span className="shrink-0 rounded bg-sky-100 px-2 py-1 text-xs font-medium text-sky-900">
                        {shiftLabel(shift).split(" · ")[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
          {users.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No active users found.</p>
          )}
        </div>
        <div className="hidden overflow-x-auto md:block">
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
              {scheduleRows.map(({ user, userIndex, days }) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-3 py-3 text-muted-foreground">{userIndex + 1}</td>
                  <th className="px-3 py-3 text-left font-medium">{user.name || user.email}</th>
                  {days.map(({ key, leave, shift }) => (
                    <td key={key} className="px-3 py-3">
                      {leave ? (
                        <span className="inline-flex min-w-20 justify-center rounded-md bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">Leave</span>
                      ) : (
                        <span className="inline-flex min-w-20 justify-center rounded-md bg-sky-100 px-2 py-1 text-xs font-medium text-sky-900">
                          {shiftLabel(shift).split(" · ")[0]}
                        </span>
                      )}
                    </td>
                  ))}
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Morning is 9:00 AM–6:00 PM; Night is 2:00 PM–11:00 PM. Date-specific rules override each user’s default shift. Leave takes precedence over any shift.
        </p>
      </section>

      <ShiftSwapManager
        currentUserId={session.user.id}
        users={swapUsers}
        requests={swapRequests.map((request) => ({
          id: request.id,
          requesterId: request.requesterId,
          recipientId: request.recipientId,
          requesterDate: dateKey(request.requesterDate),
          recipientDate: dateKey(request.recipientDate),
          note: request.note,
          status: request.status,
          requester: request.requester,
          recipient: request.recipient,
        }))}
        canApprove={canManageShifts}
      />

      {canManageShifts ? (
        <ShiftScheduleManager users={managerUsers} />
      ) : (
        <p className="text-sm text-muted-foreground">You can view your schedule. Contact an administrator to request a shift change.</p>
      )}
    </div>
  );
}
