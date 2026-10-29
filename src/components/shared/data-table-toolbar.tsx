"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { ColumnToggle } from "./column-toggle";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryDateFilters } from "./category-date-filters";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  categoryKey?: string;
  categoryOptions?: string[];
  dateKey?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  categoryKey,
  categoryOptions = [],
  dateKey,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const dateFilter = dateKey ? table.getColumn(dateKey)?.getFilterValue() as [string, string] | undefined : undefined;
  const setDateFilter = (fromDate: string, toDate: string) => {
    if (!dateKey) return;
    table.getColumn(dateKey)?.setFilterValue(fromDate || toDate ? [fromDate, toDate] : undefined);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
        {searchKey && (
          <Input
            placeholder={`Search...`}
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(e) => table.getColumn(searchKey)?.setFilterValue(e.target.value)}
            className="h-10 w-full sm:h-8 sm:w-64"
          />
        )}
        {categoryKey && (
          <CategoryDateFilters
            categories={categoryOptions}
            category={(table.getColumn(categoryKey)?.getFilterValue() as string) ?? ""}
            onCategoryChange={(value) => table.getColumn(categoryKey)?.setFilterValue(value || undefined)}
            fromDate={dateFilter?.[0] ?? ""}
            onFromDateChange={(value) => setDateFilter(value, dateFilter?.[1] ?? "")}
            toDate={dateFilter?.[1] ?? ""}
            onToDateChange={(value) => setDateFilter(dateFilter?.[0] ?? "", value)}
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
