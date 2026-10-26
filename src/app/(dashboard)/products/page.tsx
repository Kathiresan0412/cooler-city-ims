import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { productColumns } from "@/components/products/product-columns";
import { getProducts } from "@/server/queries/product.queries";
import { requirePermission } from "@/lib/permissions";
import { Plus, Upload } from "lucide-react";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  await requirePermission("products", "read");
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Manage your product catalogue">
        <Button asChild variant="outline">
          <Link href="/products/import">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Link>
        </Button>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </PageHeader>
      <DataTable columns={productColumns} data={products} searchKey="name" />
    </div>
  );
}
