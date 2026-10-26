"use client";

import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

export type LocationStockRow = {
  id: string;
  product?: { id: string; name: string; sku: string; reorderPoint: number };
  location?: { name: string };
  quantity: number;
};

const columns: ColumnDef<LocationStockRow>[] = [
  { id: "product", header: "Product", cell: ({ row }) => row.original.product?.name ?? "—" },
  { id: "sku", header: "SKU", cell: ({ row }) => row.original.product?.sku ?? "—" },
  { id: "location", header: "Location", cell: ({ row }) => row.original.location?.name ?? "—" },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => {
      const qty = Number(row.getValue("quantity"));
      const reorder = row.original.product?.reorderPoint ?? 0;
      return (
        <span className={qty <= reorder ? "font-semibold text-destructive" : ""}>{qty}</span>
      );
    },
  },
  {
    id: "reorder",
    header: "Reorder At",
    cell: ({ row }) => row.original.product?.reorderPoint ?? "—",
  },
];

export function LocationStockTable({ data }: { data: LocationStockRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
