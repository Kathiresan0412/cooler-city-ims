"use client";

import { useState } from "react";
import { BarcodeLabel } from "./barcode-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Plus, Trash2 } from "lucide-react";

interface LabelItem {
  barcode: string;
  name: string;
  price: string;
  copies: number;
}

export function LabelSheetPrint() {
  const [items, setItems] = useState<LabelItem[]>([
    { barcode: "", name: "", price: "", copies: 1 },
  ]);

  function update(i: number, field: keyof LabelItem, val: string | number) {
    const next = [...items];
    next[i] = { ...next[i], [field]: val };
    setItems(next);
  }

  function printSheet() {
    window.print();
  }

  const labelList = items.flatMap((item) =>
    Array.from({ length: item.copies }, (_, ci) => ({ ...item, key: `${item.barcode}-${ci}` }))
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Input placeholder="Barcode" value={item.barcode} onChange={(e) => update(i, "barcode", e.target.value)} />
            <Input placeholder="Product name" value={item.name} onChange={(e) => update(i, "name", e.target.value)} />
            <Input placeholder="Price" value={item.price} onChange={(e) => update(i, "price", e.target.value)} />
            <Input type="number" placeholder="Copies" min={1} value={item.copies} onChange={(e) => update(i, "copies", parseInt(e.target.value))} />
            <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => setItems([...items, { barcode: "", name: "", price: "", copies: 1 }])}>
          <Plus className="mr-2 h-4 w-4" />
          Add Row
        </Button>
      </div>

      <Button onClick={printSheet}>
        <Printer className="mr-2 h-4 w-4" />
        Print Labels
      </Button>

      {/* Print preview */}
      <div className="print:block flex flex-wrap gap-2 rounded-lg border p-4">
        {labelList.map((item) =>
          item.barcode ? (
            <BarcodeLabel key={item.key} value={item.barcode} productName={item.name} price={item.price} />
          ) : null
        )}
      </div>
    </div>
  );
}
