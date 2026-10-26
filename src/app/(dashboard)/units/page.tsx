import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { CatalogMasterManager } from "@/components/shared/catalog-master-manager";

export const metadata: Metadata = { title: "Units of Measure" };

export default async function UnitsPage() {
  await requirePermission("units", "read");
  const units = await prisma.unit.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Units of Measure" description="Define units used across products" />
      <CatalogMasterManager
        type="unit"
        rows={units.map((unit) => ({
          id: unit.id,
          name: unit.name,
          abbreviation: unit.abbreviation,
          productCount: unit._count.products,
        }))}
      />
    </div>
  );
}
