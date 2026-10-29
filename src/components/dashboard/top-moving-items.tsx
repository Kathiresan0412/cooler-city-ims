import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface MovingItem {
  id: string;
  name: string;
  sku: string;
  unit: string | null;
  week: number;
  month: number;
}

export function TopMovingItems({
  items,
  canViewProducts,
  canViewStock,
}: {
  items: MovingItem[];
  canViewProducts: boolean;
  canViewStock: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Most Stock Used</CardTitle>
        {canViewStock && (
          <Link href="/stock" className="text-xs text-primary hover:underline">
            View stock
          </Link>
        )}
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales or kitchen stock issues recorded in the last 30 days.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    {canViewProducts ? (
                      <Link href={`/products/${item.id}`} className="block truncate text-sm font-medium hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      <span className="block truncate text-sm font-medium">{item.name}</span>
                    )}
                    {/* <p className="text-xs text-muted-foreground">{item.sku}</p> */}
                  </div>
                </div>
                <div className="shrink-0 text-right text-xs text-muted-foreground">
                  <p><span className="font-medium text-foreground">{item.week.toLocaleString()} {item.unit ?? ""}</span> used in 7 days</p>
                  <p><span className="font-medium text-foreground">{item.month.toLocaleString()} {item.unit ?? ""}</span> used this month</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
