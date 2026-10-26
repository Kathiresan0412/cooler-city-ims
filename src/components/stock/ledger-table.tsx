"use client";

import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/lib/format";

export type LedgerRow = {
  id: string;
  productId: string;
  product?: { name: string; sku: string };
  locationId: string;
  movementType: string;
  quantityIn: number;
  quantityOut: number;
  balanceAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  createdAt: Date | string;
};

const columns: ColumnDef<LedgerRow>[] = [
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.getValue("createdAt")) },
  { id: "product", header: "Product", cell: ({ row }) => row.original.product?.name ?? row.original.productId },
  { accessorKey: "movementType", header: "Type", cell: ({ row }) => (row.getValue("movementType") as string).replace(/_/g, " ") },
  { accessorKey: "quantityIn", header: "In" },
  { accessorKey: "quantityOut", header: "Out" },
  { accessorKey: "balanceAfter", header: "Balance" },
  { id: "ref", header: "Reference", cell: ({ row }) => row.original.referenceType ? `${row.original.referenceType} #${row.original.referenceId}` : "—" },
];

export function LedgerTable({ data }: { data: LedgerRow[] }) {
  return <DataTable columns={columns} data={data} />;
}
