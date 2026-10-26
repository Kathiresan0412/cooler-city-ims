import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLowStockProducts } from "@/server/queries/stock.queries";

export async function LowStockList() {
  const items = await getLowStockProducts(10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Low Stock</CardTitle>
        <Link href="/reports/low-stock" className="text-xs text-primary hover:underline">
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All items are well-stocked.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <Link href={`/products/${item.id}`} className="truncate text-sm font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-xs text-muted-foreground">{item.sku}</p>
              </div>
              <Badge variant="destructive" className="flex-shrink-0">
                {Number(item.totalQty)} left
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
