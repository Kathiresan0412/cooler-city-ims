import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Latest audit log entries will appear here.</p>
      </CardContent>
    </Card>
  );
}
