import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requirePermission } from "@/lib/permissions";

export const metadata: Metadata = { title: "Reports" };

const REPORTS = [
  { title: "Stock Report", description: "Current stock levels by product and location", href: "/reports/stock" },
  { title: "Stock Valuation", description: "Inventory value at cost price", href: "/reports/valuation" },
  { title: "Stock Movements", description: "All inbound and outbound movements", href: "/reports/movements" },
  { title: "Low Stock", description: "Products below reorder point", href: "/reports/low-stock" },
  { title: "Purchases", description: "GRN and purchase order history", href: "/reports/purchases" },
  { title: "Sales", description: "Sales and issue note history", href: "/reports/sales" },
  { title: "Transfers", description: "Inter-location transfer history", href: "/reports/transfers" },
  { title: "Adjustments", description: "Manual stock adjustment history", href: "/reports/adjustments" },
  { title: "User Activity", description: "Audit trail by user", href: "/reports/user-activity" },
];

export default async function ReportsPage() {
  await requirePermission("reports", "read");

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Analytics and exports" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Link key={report.href} href={report.href}>
            <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
