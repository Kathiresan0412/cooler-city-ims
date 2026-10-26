"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/format";

export type TransferRow = {
  id: string;
  transferNumber: string;
  fromLocation: { name: string };
  toLocation: { name: string };
  status: string;
  createdAt: Date | string;
};

export const transferColumns: ColumnDef<TransferRow>[] = [
  {
    accessorKey: "transferNumber",
    header: "Reference",
    cell: ({ row }) => (
      <Link href={`/transfers/${row.original.id}`} className="font-medium hover:underline">
        {row.getValue("transferNumber")}
      </Link>
    ),
  },
  { id: "from", header: "From", cell: ({ row }) => row.original.fromLocation.name },
  { id: "to", header: "To", cell: ({ row }) => row.original.toLocation.name },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.getValue("status")} /> },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.getValue("createdAt")) },
];
