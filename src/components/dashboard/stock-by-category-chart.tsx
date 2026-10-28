import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryStock {
  name: string;
  quantity: number;
}

export function StockByCategoryChart({ data }: { data: CategoryStock[] }) {
  const maxQuantity = Math.max(1, ...data.map((category) => category.quantity));
  const totalQuantity = data.reduce((total, category) => total + category.quantity, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Stock by category</CardTitle>
        <p className="text-xs text-muted-foreground">On-hand units across active products</p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No stock is currently recorded.
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((category) => (
              <div key={category.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{category.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {category.quantity.toLocaleString()}{" "}
                    <span className="text-xs">
                      ({totalQuantity ? Math.round((category.quantity / totalQuantity) * 100) : 0}%)
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${(category.quantity / maxQuantity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
