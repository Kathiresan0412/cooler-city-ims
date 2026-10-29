"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryDateFiltersProps {
  categories: string[];
  category: string;
  onCategoryChange: (value: string) => void;
  fromDate: string;
  onFromDateChange: (value: string) => void;
  toDate: string;
  onToDateChange: (value: string) => void;
}

export function CategoryDateFilters({
  categories,
  category,
  onCategoryChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
}: CategoryDateFiltersProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
      <Select value={category || "__all_categories__"} onValueChange={(value) => onCategoryChange(value === "__all_categories__" ? "" : value)}>
        <SelectTrigger aria-label="Filter by category" className="col-span-2 h-10 w-full sm:col-span-1 sm:h-8 sm:w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all_categories__">All categories</SelectItem>
          {categories.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label className="min-w-0 space-y-1 sm:space-y-0">
        <span className="block text-xs font-medium text-muted-foreground sm:sr-only">From</span>
        <Input
          aria-label="From date"
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          className="h-10 w-full min-w-0 px-2 text-sm sm:h-8 sm:w-[150px] sm:px-3"
        />
      </label>
      <label className="min-w-0 space-y-1 sm:space-y-0">
        <span className="block text-xs font-medium text-muted-foreground sm:sr-only">To</span>
        <Input
          aria-label="To date"
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
          className="h-10 w-full min-w-0 px-2 text-sm sm:h-8 sm:w-[150px] sm:px-3"
        />
      </label>
    </div>
  );
}
