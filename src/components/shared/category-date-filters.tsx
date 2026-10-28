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
    <div className="flex flex-wrap items-center gap-2">
      <Select value={category || "__all_categories__"} onValueChange={(value) => onCategoryChange(value === "__all_categories__" ? "" : value)}>
        <SelectTrigger aria-label="Filter by category" className="h-8 w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all_categories__">All categories</SelectItem>
          {categories.map((name) => (
            <SelectItem key={name} value={name}>{name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        aria-label="From date"
        type="date"
        value={fromDate}
        onChange={(event) => onFromDateChange(event.target.value)}
        className="h-8 w-[150px]"
      />
      <Input
        aria-label="To date"
        type="date"
        value={toDate}
        onChange={(event) => onToDateChange(event.target.value)}
        className="h-8 w-[150px]"
      />
    </div>
  );
}
