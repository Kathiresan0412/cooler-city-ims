import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProductForm } from "@/components/products/product-form";
import { requirePermission } from "@/lib/permissions";
import { getProductById, getCategories, getUnits } from "@/server/queries/product.queries";

export const metadata: Metadata = { title: "Edit Product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requirePermission("products", "update");
  const [product, categories, units] = await Promise.all([
    getProductById(id),
    getCategories(),
    getUnits(),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Product" description={product.name} />
      <ProductForm product={product} categories={categories} units={units} />
    </div>
  );
}
