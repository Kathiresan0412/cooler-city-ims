"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { ArrowUpDown, Pencil } from "lucide-react";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  category?: { name: string } | null;
  unit?: { abbreviation: string } | null;
};

export const productColumns: ColumnDef<ProductRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" size="sm" onClick={() => column.toggleSorting()}>
        Name <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <Link href={`/products/${row.original.id}`} className="font-medium hover:underline">
        {row.getValue("name")}
      </Link>
    ),
  },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "barcode", header: "Barcode" },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "—",
  },
  {
    accessorKey: "costPrice",
    header: "Cost",
    cell: ({ row }) => formatCurrency(row.getValue("costPrice")),
  },
  {
    accessorKey: "sellingPrice",
    header: "Price",
    cell: ({ row }) => formatCurrency(row.getValue("sellingPrice")),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) =>
      row.getValue("isActive") ? (
        <Badge variant="outline" className="border-transparent bg-green-100 text-green-800">Active</Badge>
      ) : (
        <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">Inactive</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/products/${row.original.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];
