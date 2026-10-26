import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";
import { requirePermission } from "@/lib/permissions";
import { getCategories, getUnits } from "@/server/queries/product.queries";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  await requirePermission("products", "create");
  const [categories, units] = await Promise.all([
    getCategories(),
    getUnits(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="New Product" description="Add a product to your catalogue" />
      <ProductForm categories={categories} units={units} />
    </div>
  );
}
