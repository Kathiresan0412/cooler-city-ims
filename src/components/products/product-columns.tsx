"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { ArrowUpDown, ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";

export type ProductRow = {
  id: string;
  name: string;
  costPrice: number;
  isActive: boolean;
  imageUrl?: string | null;
  category?: { name: string } | null;
  unit?: { name: string; abbreviation: string } | null;
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
  {
    id: "image",
    header: "Product Image",
    cell: ({ row }) => row.original.imageUrl ? (
      <Image
        src={row.original.imageUrl}
        alt={row.original.name}
        width={40}
        height={40}
        unoptimized
        className="h-10 w-10 rounded object-cover"
      />
    ) : <ImageIcon className="h-5 w-5 text-muted-foreground" aria-label="No product image" />,
  },
  {
    id: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name ?? "—",
  },
  {
    id: "unit",
    header: "Unit",
    cell: ({ row }) => row.original.unit ? `${row.original.unit.name} (${row.original.unit.abbreviation})` : "—",
  },
  {
    accessorKey: "costPrice",
    header: "Cost Price",
    cell: ({ row }) => formatCurrency(row.getValue("costPrice")),
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
