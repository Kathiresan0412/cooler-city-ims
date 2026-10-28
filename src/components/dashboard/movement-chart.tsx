import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailyMovement {
  date: string;
  inbound: number;
  outbound: number;
}

export function MovementChart({ data }: { data: DailyMovement[] }) {
  const maxValue = Math.max(1, ...data.map((day) => Math.max(day.inbound, day.outbound)));
  const inboundTotal = data.reduce((total, day) => total + day.inbound, 0);
  const outboundTotal = data.reduce((total, day) => total + day.outbound, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold">Stock movements</CardTitle>
          <p className="text-xs text-muted-foreground">Daily quantities for the last 30 days</p>
        </div>
        <div className="flex shrink-0 gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-primary" /> In {inboundTotal.toLocaleString()}
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-sm bg-orange-400" /> Out {outboundTotal.toLocaleString()}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {inboundTotal + outboundTotal === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No stock movements recorded in the last 30 days.
          </div>
        ) : (
          <div
            className="flex h-48 items-end gap-1 border-b border-border px-1 pt-3"
            role="img"
            aria-label={`Stock movements over 30 days: ${inboundTotal} units received and ${outboundTotal} units issued`}
          >
            {data.map((day) => {
              const inboundHeight = (day.inbound / maxValue) * 100;
              const outboundHeight = (day.outbound / maxValue) * 100;
              return (
                <div
                  key={day.date}
                  className="flex h-full min-w-0 flex-1 items-end justify-center gap-px"
                  title={`${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${day.date}T00:00:00Z`))}: ${day.inbound} in, ${day.outbound} out`}
                >
                  <span
                    className="w-full max-w-2 rounded-t-sm bg-primary"
                    style={{ height: `${Math.max(inboundHeight, day.inbound > 0 ? 2 : 0)}%` }}
                  />
                  <span
                    className="w-full max-w-2 rounded-t-sm bg-orange-400"
                    style={{ height: `${Math.max(outboundHeight, day.outbound > 0 ? 2 : 0)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  );
}
