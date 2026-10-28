import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import Link from "next/link";

interface LoginHistoryEntry {
  id: string;
  email: string;
  successful: boolean;
  ipAddress: string | null;
  createdAt: Date;
  user: { name: string | null } | null;
}

export function LoginHistory({ entries }: { entries: LoginHistoryEntry[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Login history</CardTitle>
        <Link href="/audit-logs" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No login attempts have been recorded yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Badge variant={entry.successful ? "secondary" : "destructive"}>
                    {entry.successful ? "Success" : "Failed"}
                  </Badge>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{entry.user?.name ?? entry.email}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.ipAddress ?? "IP unavailable"}
                    </p>
                  </div>
                </div>
                <time
                  dateTime={entry.createdAt.toISOString()}
                  className="shrink-0 text-xs text-muted-foreground"
                >
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
