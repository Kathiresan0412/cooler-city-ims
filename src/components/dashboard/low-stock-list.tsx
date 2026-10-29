import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  totalQty: number;
  reorderPoint: number;
}

export function LowStockList({
  items,
  canViewProducts,
  canViewStock,
}: {
  items: LowStockItem[];
  canViewProducts: boolean;
  canViewStock: boolean;
}) {

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Low Stock</CardTitle>
        {canViewStock && (
          <Link href="/stock" className="text-xs text-primary hover:underline">
            View stock
          </Link>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">All items are well-stocked.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                {canViewProducts ? (
                  <Link href={`/products/${item.id}`} className="truncate text-sm font-medium hover:underline">
                    {item.name}
                  </Link>
                ) : (
                  <span className="truncate text-sm font-medium">{item.name}</span>
                )}
                {/* <p className="text-xs text-muted-foreground">{item.sku}</p> */}
              </div>
              <Badge variant="destructive" className="flex-shrink-0">
                {item.totalQty.toLocaleString()} / {item.reorderPoint.toLocaleString()}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
