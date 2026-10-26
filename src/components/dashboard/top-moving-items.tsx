import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export async function TopMovingItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Top Moving Items</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Data will load here from stock ledger.</p>
      </CardContent>
    </Card>
  );
}
