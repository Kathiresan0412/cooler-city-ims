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
import Image from "next/image";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Product Detail" };

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("products", "read");
  const product = await getProductById(id);
  if (!product) notFound();

  const stockByLocation = await getStockByProduct(id);

  return (
    <div className="space-y-6">
      <PageHeader title={product.name} description="Product information">
        <Button asChild>
          <Link href={`/products/${id}/edit`}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </Button>
      </PageHeader>
      <section className="grid gap-6 rounded-lg border p-6 sm:grid-cols-[160px_1fr]">
        <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-md bg-muted">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} fill unoptimized className="object-cover" />
          ) : (
            <span className="text-sm text-muted-foreground">No image</span>
          )}
        </div>
        <dl className="grid content-start gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Category</dt>
            <dd className="font-medium">{product.category?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Unit</dt>
            <dd className="font-medium">{product.unit ? `${product.unit.name} (${product.unit.abbreviation})` : "—"}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Cost Price</dt>
            <dd className="font-medium">{formatCurrency(product.costPrice)}</dd>
          </div>
        </dl>
      </section>
      <LocationStockTable data={stockByLocation} />
    </div>
  );
}
