import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";
import { requirePermission } from "@/lib/permissions";
import { getCategories, getBrands, getUnits } from "@/server/queries/product.queries";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  await requirePermission("products", "create");
  const [categories, brands, units] = await Promise.all([
    getCategories(),
    getBrands(),
    getUnits(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Product" description="Add a product to your catalogue" />
      <ProductForm categories={categories} brands={brands} units={units} />
    </div>
  );
}
