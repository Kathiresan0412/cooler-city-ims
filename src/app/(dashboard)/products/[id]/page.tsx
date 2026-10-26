import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { requirePermission } from "@/lib/permissions";
import { getProductById } from "@/server/queries/product.queries";
import { getStockByProduct } from "@/server/queries/stock.queries";
import { LocationStockTable } from "@/components/stock/location-stock-table";
import { Pencil } from "lucide-react";

export const metadata: Metadata = { title: "Product Detail" };

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("products", "read");
  const product = await getProductById(params.id);
  if (!product) notFound();

  const stockByLocation = await getStockByProduct(params.id);

  return (
    <div className="space-y-6">
      <PageHeader title={product.name} description={`SKU: ${product.sku}`}>
        <Button asChild>
          <Link href={`/products/${params.id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </PageHeader>
      <LocationStockTable data={stockByLocation} />
    </div>
  );
}
