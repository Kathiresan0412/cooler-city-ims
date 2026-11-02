"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { CalendarDays, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type TodayShift = { id: string; name: string; email: string; shift: string | null };

export function TodayShiftsDialog({ date, shifts }: { date: string; shifts: TodayShift[] }) {
  const [colomboMinutes, setColomboMinutes] = useState<number | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Colombo",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }).formatToParts(new Date());
      const hour = Number(parts.find((part) => part.type === "hour")?.value);
      const minute = Number(parts.find((part) => part.type === "minute")?.value);
      setColomboMinutes(hour * 60 + minute);
    };
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="outline"><CalendarDays className="h-4 w-4" /> Today’s shifts</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[80vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold">Today’s staff shifts</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">{date}</Dialog.Description>
            </div>
            <Dialog.Close asChild><Button variant="ghost" size="icon" aria-label="Close"><X className="h-4 w-4" /></Button></Dialog.Close>
          </div>
          <div className="mt-5 divide-y rounded-md border">
            {shifts.length === 0 ? <p className="p-4 text-sm text-muted-foreground">No active staff found.</p> : shifts.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 p-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{item.name}</p><p className="truncate text-xs text-muted-foreground">{item.email}</p></div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${isShiftActive(item.shift, colomboMinutes) ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" : item.shift ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {item.shift === "NINE_TO_SIX" ? "Morning · 9 AM–6 PM" : item.shift === "TWO_TO_ELEVEN" ? "Night · 2 PM–11 PM" : "Leave"}
                </span>
              </div>
            ))}
          </div>
          <Dialog.Close asChild><Button className="mt-5 w-full" variant="outline">Close</Button></Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function isShiftActive(shift: string | null, minutes: number | null) {
  if (minutes === null) return false;
  if (shift === "NINE_TO_SIX") return minutes >= 9 * 60 && minutes < 18 * 60;
  if (shift === "TWO_TO_ELEVEN") return minutes >= 14 * 60 && minutes < 23 * 60;
  return false;
}
