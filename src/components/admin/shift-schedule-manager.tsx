"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { ShiftRepeat, WorkShift } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  createShiftSchedule,
  createUserLeave,
  deleteShiftSchedule,
  deleteUserLeave,
  updateShiftSchedule,
  updateUserLeave,
} from "@/server/actions/shift.actions";
import { useRouter } from "next/navigation";

const weekdays = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

type ScheduleUser = {
  id: string;
  name: string | null;
  email: string;
  defaultShift: WorkShift;
  shiftSchedules: {
    id: string;
    updatedAt: string;
    shift: WorkShift;
    startsOn: string;
    endsOn: string | null;
    repeat: ShiftRepeat;
    weekdays: number[];
  }[];
  leaves: {
    id: string;
    updatedAt: string;
    startsOn: string;
    endsOn: string | null;
    repeat: ShiftRepeat;
    weekdays: number[];
    reason: string | null;
  }[];
};

function shiftLabel(shift: WorkShift) {
  return shift === "NINE_TO_SIX" ? "Morning · 9:00 AM–6:00 PM" : "Night · 2:00 PM–11:00 PM";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function repeatLabel(rule: ScheduleUser["shiftSchedules"][number]) {
  if (rule.repeat === "ONCE") return "Once";
  if (rule.repeat === "DAILY") return "Every day";
  return weekdays
    .filter((day) => rule.weekdays.includes(day.value))
    .map((day) => day.label)
    .join(", ");
}

export function ShiftScheduleManager({ users }: { users: ScheduleUser[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [repeat, setRepeat] = useState<ShiftRepeat>("WEEKLY");
  const [selectedDays, setSelectedDays] = useState<number[]>(weekdays.map((day) => day.value));
  const [leaveRepeat, setLeaveRepeat] = useState<ShiftRepeat>("ONCE");
  const [selectedLeaveDays, setSelectedLeaveDays] = useState<number[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savingLeave, setSavingLeave] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [editingLeaveId, setEditingLeaveId] = useState<string | null>(null);
  const [shiftPerson, setShiftPerson] = useState("");
  const [leavePerson, setLeavePerson] = useState("");
  const [shiftPage, setShiftPage] = useState(0);
  const [leavePage, setLeavePage] = useState(0);
  const pageSize = 5;

  function setField(id: string, value: string) {
    const field = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
    if (field) field.value = value;
  }

  function editSchedule(user: ScheduleUser, rule: ScheduleUser["shiftSchedules"][number]) {
    setEditingScheduleId(rule.id);
    setField("schedule-user", user.id);
    setField("schedule-shift", rule.shift);
    setField("schedule-start", rule.startsOn);
    setField("schedule-end", rule.endsOn ?? "");
    setRepeat(rule.repeat);
    setSelectedDays(rule.weekdays);
    document.getElementById("schedule-user")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function editLeave(user: ScheduleUser, leave: ScheduleUser["leaves"][number]) {
    setEditingLeaveId(leave.id);
    setField("leave-user", user.id);
    setField("leave-start", leave.startsOn);
    setField("leave-end", leave.endsOn ?? "");
    setField("leave-reason", leave.reason ?? "");
    setLeaveRepeat(leave.repeat);
    setSelectedLeaveDays(leave.weekdays);
    document.getElementById("leave-user")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submitSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSavingSchedule(true);
    try {
      const payload = {
        userId: String(values.get("userId") ?? ""),
        shift: String(values.get("shift") ?? "") as WorkShift,
        startsOn: String(values.get("startsOn") ?? ""),
        endsOn: String(values.get("endsOn") ?? ""),
        repeat,
        weekdays: repeat === "WEEKLY" ? selectedDays : [],
      };
      const result = editingScheduleId
        ? await updateShiftSchedule(editingScheduleId, payload)
        : await createShiftSchedule(payload);
      if (!result.success) {
        toast({ title: "Could not save schedule", description: result.error, variant: "destructive" });
        return;
      }
      form.reset();
      setRepeat("WEEKLY");
      setSelectedDays(weekdays.map((day) => day.value));
      setEditingScheduleId(null);
      toast({ title: editingScheduleId ? "Shift schedule updated" : "Shift schedule saved" });
      router.refresh();
    } catch {
      toast({ title: "Could not save schedule", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingSchedule(false);
    }
  }

  async function submitLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    setSavingLeave(true);
    try {
      const payload = {
        userId: String(values.get("userId") ?? ""),
        startsOn: String(values.get("startsOn") ?? ""),
        endsOn: String(values.get("endsOn") ?? ""),
        repeat: leaveRepeat,
        weekdays: leaveRepeat === "WEEKLY" ? selectedLeaveDays : [],
        reason: String(values.get("reason") ?? ""),
      };
      const result = editingLeaveId
        ? await updateUserLeave(editingLeaveId, payload)
        : await createUserLeave(payload);
      if (!result.success) {
        toast({ title: "Could not save leave", description: result.error, variant: "destructive" });
        return;
      }
      form.reset();
      setLeaveRepeat("ONCE");
      setSelectedLeaveDays([]);
      setEditingLeaveId(null);
      toast({ title: editingLeaveId ? "Leave updated" : "Leave recorded" });
      router.refresh();
    } catch {
      toast({ title: "Could not save leave", description: "Please try again.", variant: "destructive" });
    } finally {
      setSavingLeave(false);
    }
  }

  async function removeSchedule(id: string) {
    setDeletingId(id);
    try {
      const result = await deleteShiftSchedule(id);
      if (!result.success) {
        toast({ title: "Could not remove schedule", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Shift schedule removed" });
      router.refresh();
    } catch {
      toast({ title: "Could not remove schedule", description: "Please try again.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  async function removeLeave(id: string) {
    setDeletingId(id);
    try {
      const result = await deleteUserLeave(id);
      if (!result.success) {
        toast({ title: "Could not remove leave", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Leave removed" });
      router.refresh();
    } catch {
      toast({ title: "Could not remove leave", description: "Please try again.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  }

  const allRules = users.flatMap((user) => user.shiftSchedules.map((rule) => ({ user, rule })))
    .filter(({ user }) => !shiftPerson || user.id === shiftPerson)
    .sort((a, b) => Date.parse(b.rule.updatedAt) - Date.parse(a.rule.updatedAt));
  const allLeaves = users.flatMap((user) => user.leaves.map((leave) => ({ user, leave })))
    .filter(({ user }) => !leavePerson || user.id === leavePerson)
    .sort((a, b) => Date.parse(b.leave.updatedAt) - Date.parse(a.leave.updatedAt));
  const visibleRules = allRules.slice(shiftPage * pageSize, (shiftPage + 1) * pageSize);
  const visibleLeaves = allLeaves.slice(leavePage * pageSize, (leavePage + 1) * pageSize);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="space-y-5 rounded-lg border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold">Assign a shift</h2>
          <p className="text-sm text-muted-foreground">
            A new rule applies on and after its start date. Earlier dates are unchanged; newer rules take priority.
          </p>
        </div>
        <form id="schedule-form" onSubmit={submitSchedule} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="schedule-user">User</Label>
            <select id="schedule-user" name="userId" defaultValue="" required disabled={!users.length || savingSchedule} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="" disabled>Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-shift">Shift</Label>
            <select id="schedule-shift" name="shift" defaultValue="NINE_TO_SIX" disabled={savingSchedule} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="NINE_TO_SIX">Morning · 9:00 AM–6:00 PM</option>
              <option value="TWO_TO_ELEVEN">Night · 2:00 PM–11:00 PM</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schedule-start">Starts on</Label>
              <Input id="schedule-start" name="startsOn" type="date" required disabled={savingSchedule} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-end">Ends on (optional)</Label>
              <Input id="schedule-end" name="endsOn" type="date" disabled={repeat === "ONCE" || savingSchedule} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="schedule-repeat">Repeat</Label>
            <select
              id="schedule-repeat"
              value={repeat}
              onChange={(event) => setRepeat(event.target.value as ShiftRepeat)}
              disabled={savingSchedule}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ONCE">Only this date</option>
              <option value="DAILY">Every day</option>
              <option value="WEEKLY">Selected days each week</option>
            </select>
          </div>
          {repeat === "WEEKLY" && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Repeat on</legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      disabled={savingSchedule}
                      onChange={(event) => setSelectedDays((current) =>
                        event.target.checked
                          ? [...current, day.value].sort((a, b) => a - b)
                          : current.filter((value) => value !== day.value)
                      )}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <p className="text-xs text-muted-foreground">
            Leave the end date empty to keep a repeating rule active until a later rule overrides it.
          </p>
          <Button type="submit" disabled={!users.length || savingSchedule}>
            {savingSchedule && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingScheduleId ? "Update shift" : "Save shift"}
          </Button>
          {editingScheduleId && <Button type="button" variant="outline" onClick={() => { setEditingScheduleId(null); (document.getElementById("schedule-form") as HTMLFormElement).reset(); setRepeat("WEEKLY"); setSelectedDays(weekdays.map((day) => day.value)); }}>Cancel edit</Button>}
          {!users.length && <p className="text-sm text-muted-foreground">No active users to schedule.</p>}
        </form>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">Shift rules</h3>
          <select aria-label="Filter shift rules by person" value={shiftPerson} onChange={(event) => { setShiftPerson(event.target.value); setShiftPage(0); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All people</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
          </select>
          {allRules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No date-specific shift rules yet.</p>
          ) : (
            <ul className="space-y-2">
              {visibleRules.map(({ user, rule }) => (
                <li key={rule.id} className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">{user.name || user.email} · {shiftLabel(rule.shift)}</p>
                    <p className="text-muted-foreground">
                      {repeatLabel(rule)} from {formatDate(rule.startsOn)}
                      {rule.repeat !== "ONCE" && ` until ${rule.endsOn ? formatDate(rule.endsOn) : "overridden"}`}
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <Button type="button" variant="ghost" size="icon" aria-label="Edit shift rule" onClick={() => editSchedule(user, rule)}><Pencil className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove shift rule" disabled={deletingId === rule.id} onClick={() => removeSchedule(rule.id)}>
                      {deletingId === rule.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {allRules.length > pageSize && <div className="flex items-center justify-between text-sm"><span>{shiftPage + 1} / {Math.ceil(allRules.length / pageSize)}</span><div className="flex gap-2"><Button type="button" variant="outline" disabled={shiftPage === 0} onClick={() => setShiftPage((page) => page - 1)}>Previous</Button><Button type="button" variant="outline" disabled={(shiftPage + 1) * pageSize >= allRules.length} onClick={() => setShiftPage((page) => page + 1)}>Next</Button></div></div>}
        </div>
      </section>

      <section className="space-y-5 rounded-lg border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold">Record leave</h2>
          <p className="text-sm text-muted-foreground">Leave overrides scheduled shifts. Set it once or repeat it every week.</p>
        </div>
        <form id="leave-form" onSubmit={submitLeave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="leave-user">User</Label>
            <select id="leave-user" name="userId" defaultValue="" required disabled={!users.length || savingLeave} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="" disabled>Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name || user.email}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="leave-repeat">Repeat</Label>
            <select
              id="leave-repeat"
              value={leaveRepeat}
              onChange={(event) => setLeaveRepeat(event.target.value as ShiftRepeat)}
              disabled={savingLeave}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ONCE">One time / date range</option>
              <option value="WEEKLY">Every week on selected days</option>
              <option value="DAILY">Every day</option>
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="leave-start">Starts on</Label>
              <Input id="leave-start" name="startsOn" type="date" required disabled={savingLeave} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leave-end">Ends on (optional for recurring leave)</Label>
              <Input id="leave-end" name="endsOn" type="date" required={leaveRepeat === "ONCE"} disabled={savingLeave} />
            </div>
          </div>
          {leaveRepeat === "WEEKLY" && (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Leave on</legend>
              <div className="flex flex-wrap gap-2">
                {weekdays.map((day) => (
                  <label key={day.value} className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedLeaveDays.includes(day.value)}
                      disabled={savingLeave}
                      onChange={(event) => setSelectedLeaveDays((current) =>
                        event.target.checked
                          ? [...current, day.value].sort((a, b) => a - b)
                          : current.filter((value) => value !== day.value)
                      )}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="space-y-2">
            <Label htmlFor="leave-reason">Note (optional)</Label>
            <Input id="leave-reason" name="reason" maxLength={250} disabled={savingLeave} />
          </div>
          <Button type="submit" disabled={!users.length || savingLeave}>
            {savingLeave && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingLeaveId ? "Update leave" : "Save leave"}
          </Button>
          {editingLeaveId && <Button type="button" variant="outline" onClick={() => { setEditingLeaveId(null); (document.getElementById("leave-form") as HTMLFormElement).reset(); setLeaveRepeat("ONCE"); setSelectedLeaveDays([]); }}>Cancel edit</Button>}
        </form>

        <div className="space-y-3 border-t pt-4">
          <h3 className="font-medium">Leave records</h3>
          <select aria-label="Filter leave records by person" value={leavePerson} onChange={(event) => { setLeavePerson(event.target.value); setLeavePage(0); }} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
            <option value="">All people</option>
            {users.map((user) => <option key={user.id} value={user.id}>{user.name || user.email}</option>)}
          </select>
          {allLeaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave recorded.</p>
          ) : (
            <ul className="space-y-2">
              {visibleLeaves.map(({ user, leave }) => (
                <li key={leave.id} className="flex items-start justify-between gap-3 rounded-md border p-3 text-sm">
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-muted-foreground">
                      {leave.repeat === "WEEKLY"
                        ? `Every ${weekdays.filter((day) => leave.weekdays.includes(day.value)).map((day) => day.label).join(", ")} from ${formatDate(leave.startsOn)}`
                        : leave.repeat === "DAILY"
                          ? `Every day from ${formatDate(leave.startsOn)}${leave.endsOn ? ` until ${formatDate(leave.endsOn)}` : ""}`
                          : `${formatDate(leave.startsOn)} - ${leave.endsOn ? formatDate(leave.endsOn) : ""}`}
                    </p>
                    {leave.reason && <p className="text-muted-foreground">{leave.reason}</p>}
                  </div>
                  <div className="flex shrink-0">
                    <Button type="button" variant="ghost" size="icon" aria-label="Edit leave record" onClick={() => editLeave(user, leave)}><Pencil className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" aria-label="Remove leave record" disabled={deletingId === leave.id} onClick={() => removeLeave(leave.id)}>
                      {deletingId === leave.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {allLeaves.length > pageSize && <div className="flex items-center justify-between text-sm"><span>{leavePage + 1} / {Math.ceil(allLeaves.length / pageSize)}</span><div className="flex gap-2"><Button type="button" variant="outline" disabled={leavePage === 0} onClick={() => setLeavePage((page) => page - 1)}>Previous</Button><Button type="button" variant="outline" disabled={(leavePage + 1) * pageSize >= allLeaves.length} onClick={() => setLeavePage((page) => page + 1)}>Next</Button></div></div>}
        </div>
      </section>
    </div>
  );
}
