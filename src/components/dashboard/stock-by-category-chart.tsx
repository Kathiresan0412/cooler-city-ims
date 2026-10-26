import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function StockByCategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Stock by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Chart will render here
      </CardContent>
    </Card>
  );
}
