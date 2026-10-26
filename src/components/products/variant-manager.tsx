"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

interface Variant {
  name: string;
  sku: string;
  barcode?: string;
  costPrice: number;
}

interface VariantManagerProps {
  value?: Variant[];
  onChange?: (variants: Variant[]) => void;
}

export function VariantManager({ value = [], onChange }: VariantManagerProps) {
  function add() {
    onChange?.([...value, { name: "", sku: "", barcode: "", costPrice: 0 }]);
  }

  function remove(index: number) {
    onChange?.(value.filter((_, i) => i !== index));
  }

  function update(index: number, field: keyof Variant, val: string | number) {
    const next = [...value];
    next[index] = { ...next[index], [field]: val };
    onChange?.(next);
  }

  return (
    <div className="space-y-3">
      {value.map((variant, i) => (
        <div key={i} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Variant name (e.g. Red / Large)"
              value={variant.name}
              onChange={(e) => update(i, "name", e.target.value)}
            />
          </div>
          <div className="w-32">
            <Input
              placeholder="SKU"
              value={variant.sku}
              onChange={(e) => update(i, "sku", e.target.value)}
            />
          </div>
          <div className="w-28">
            <Input
              type="number"
              placeholder="Cost"
              value={variant.costPrice}
              onChange={(e) => update(i, "costPrice", parseFloat(e.target.value))}
            />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-2 h-4 w-4" />
        Add Variant
      </Button>
    </div>
  );
}
