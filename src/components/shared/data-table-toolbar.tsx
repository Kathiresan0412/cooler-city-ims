"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ColumnToggle } from "./column-toggle";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
}

export function DataTableToolbar<TData>({ table, searchKey }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        {searchKey && (
          <Input
            placeholder={`Search...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className="h-8 w-64"
          />
        )}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            Reset
            <X className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
      <ColumnToggle table={table} />
    </div>
  );
}
