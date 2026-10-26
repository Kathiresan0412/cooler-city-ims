"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";

export type VarianceRow = {
  id: string;
  product: { name: string; sku: string };
  systemQty: number;
  countedQty: number;
  variance: number;
  note?: string | null;
};

const columns: ColumnDef<VarianceRow>[] = [
  { id: "product", header: "Product", cell: ({ row }) => row.original.product.name },
  { id: "sku", header: "SKU", cell: ({ row }) => row.original.product.sku },
  { accessorKey: "systemQty", header: "System Qty" },
  { accessorKey: "countedQty", header: "Counted" },
  {
    accessorKey: "variance",
    header: "Variance",
    cell: ({ row }) => {
      const v = Number(row.getValue("variance"));
      return (
        <span className={v < 0 ? "text-destructive font-semibold" : v > 0 ? "text-green-600 font-semibold" : ""}>
          {v > 0 ? `+${v}` : v}
        </span>
      );
    },
  },
  { accessorKey: "note", header: "Note", cell: ({ row }) => row.original.note ?? "—" },
];

export function VarianceTable({ stockTakeId }: { stockTakeId: string }) {
  // Data would be fetched in the page and passed as props in a real implementation
  return <DataTable columns={columns} data={[]} />;
}
