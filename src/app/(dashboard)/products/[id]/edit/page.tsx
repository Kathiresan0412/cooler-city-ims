import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";
import { requirePermission } from "@/lib/permissions";
import { getProductById, getCategories, getBrands, getUnits } from "@/server/queries/product.queries";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  await requirePermission("products", "update");
  const [product, categories, brands, units] = await Promise.all([
    getProductById(params.id),
    getCategories(),
    getBrands(),
    getUnits(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Product" description={product.name} />
      <ProductForm product={product} categories={categories} brands={brands} units={units} />
    </div>
  );
}
