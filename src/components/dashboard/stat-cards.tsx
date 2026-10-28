import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { Package, TrendingDown, ArrowLeftRight, AlertTriangle } from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  totalStockValue: number;
  pendingTransfers: number;
  lowStockItems: number;
}

export function StatCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      description: "Active SKUs in catalogue",
    },
    {
      title: "Stock Value",
      value: formatCurrency(stats.totalStockValue),
      icon: TrendingDown,
      description: "At cost price",
    },
    {
      title: "Low Stock Alerts",
      value: stats.lowStockItems.toLocaleString(),
      icon: AlertTriangle,
      description: "Below reorder point",
    },
    {
      title: "Pending Transfers",
      value: stats.pendingTransfers.toLocaleString(),
      icon: ArrowLeftRight,
      description: "Awaiting approval or receipt",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
