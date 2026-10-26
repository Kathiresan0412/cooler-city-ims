import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { CatalogMasterManager } from "@/components/shared/catalog-master-manager";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  await requirePermission("categories", "read");
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Categories" description="Organise products into categories" />
      <CatalogMasterManager
        type="category"
        rows={categories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          productCount: category._count.products,
          childCount: category._count.children,
        }))}
      />
    </div>
  );
}
