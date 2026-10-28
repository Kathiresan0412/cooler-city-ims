import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface ActivityEntry {
  id: string;
  action: string;
  resource: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
}

export function RecentActivity({ entries }: { entries: ActivityEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Recent activity</CardTitle>
        <Link href="/audit-logs" className="text-xs text-primary hover:underline">
          View audit log
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div key={entry.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p className="text-sm">
                  <span className="font-medium">{entry.user?.name ?? entry.user?.email ?? "System"}</span>{" "}
                  <span className="text-muted-foreground">
                    {entry.action.toLowerCase()} {entry.resource.toLowerCase()}
                  </span>
                </p>
                <time dateTime={entry.createdAt.toISOString()} className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(entry.createdAt, { hour: "numeric", minute: "2-digit" })}
                </time>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
