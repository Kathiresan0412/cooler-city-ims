"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Loader2, PackagePlus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryDateFilters } from "@/components/shared/category-date-filters";
import { formatDate } from "@/lib/format";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue,} from "@/components/ui/select";
import {AlertDialog,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { adjustProductStock } from "@/server/actions/stock.actions";

interface ProductOption {
  id: string;
  name: string;
  category: string | null;
  unitAbbreviation: string | null;
  totalQuantity: number;
  stockUpdatedAt: Date | null;
  stockByLocation: { locationId: string; quantity: number }[];
}

interface LocationOption {
  id: string;
  name: string;
}

interface CurrentStockManagerProps {
  products: ProductOption[];
  locations: LocationOption[];
}

export function CurrentStockManager({ products, locations }: CurrentStockManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "set">("add");
  const [productId, setProductId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<"category" | "date" | "quantity">("category");
  const [sortDescending, setSortDescending] = useState(false);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter((value): value is string => Boolean(value)))].sort(),
    [products],
  );
  const visibleProducts = useMemo(() => products
    .filter((product) => !categoryFilter || product.category === categoryFilter)
    .filter((product) => {
      if (!fromDate && !toDate) return true;
      if (!product.stockUpdatedAt) return false;
      const date = product.stockUpdatedAt.toISOString().slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    })
    .sort((a, b) => {
      const comparison = sortField === "category"
        ? (a.category ?? "").localeCompare(b.category ?? "")
        : sortField === "date"
          ? (a.stockUpdatedAt?.getTime() ?? 0) - (b.stockUpdatedAt?.getTime() ?? 0)
          : a.totalQuantity - b.totalQuantity;
      return sortDescending ? -comparison : comparison;
    }), [products, categoryFilter, fromDate, toDate, sortField, sortDescending]);

  function toggleSort(field: "category" | "date" | "quantity") {
    if (sortField === field) setSortDescending((descending) => !descending);
    else {
      setSortField(field);
      setSortDescending(field === "date");
    }
  }

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId),
    [products, productId]
  );

  function openAddDialog() {
    setMode("add");
    setProductId("");
    setLocationId(locations[0]?.id ?? "");
    setQuantity("");
    setIsOpen(true);
  }

  function openEditDialog(product: ProductOption) {
    setMode("set");
    setProductId(product.id);
    const preferredLocation = product.stockByLocation.find((stock) => stock.quantity > 0)?.locationId;
    setLocationId(preferredLocation ?? locations[0]?.id ?? "");
    setQuantity(String(product.totalQuantity));
    setIsOpen(true);
  }

  async function saveQuantity() {
    if (!productId || !locationId || !quantity.trim()) {
      toast({ title: "Missing information", description: "Select a product, location, and quantity.", variant: "destructive" });
      return;
    }
    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0 || (mode === "add" && parsedQuantity <= 0)) {
      toast({
        title: "Invalid quantity",
        description: mode === "add" ? "Enter a quantity greater than zero." : "Quantity cannot be negative.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await adjustProductStock({
        productId,
        locationId,
        quantity: parsedQuantity,
        mode,
      });
      if (!result.success) {
        toast({ title: "Could not update stock", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: mode === "add" ? "Stock added" : "Quantity updated" });
      setIsOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Could not update stock", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  const locationQuantity = selectedProduct?.stockByLocation.find((stock) => stock.locationId === locationId)?.quantity ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="w-full sm:w-auto" onClick={openAddDialog} disabled={locations.length === 0 || products.length === 0}>
          <PackagePlus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      <div className="overflow-x-auto pb-1">
      <CategoryDateFilters
        categories={categories}
        category={categoryFilter}
        onCategoryChange={setCategoryFilter}
        fromDate={fromDate}
        onFromDateChange={setFromDate}
        toDate={toDate}
        onToDateChange={setToDate}
      />
      </div>

      <div className="hidden overflow-hidden rounded-md border md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">
                <Button variant="ghost" size="sm" onClick={() => toggleSort("category")}>
                  Category <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="px-4 py-3 text-left font-medium">
                <Button variant="ghost" size="sm" onClick={() => toggleSort("date")}>
                  Last updated <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="px-4 py-3 text-left font-medium">Unit Abbreviation</th>
              <th className="px-4 py-3 text-right font-medium">
                <Button variant="ghost" size="sm" onClick={() => toggleSort("quantity")}>
                  Qty <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleProducts.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{product.category ?? "—"}</td>
                <td className="px-4 py-3">{formatDate(product.stockUpdatedAt)}</td>
                <td className="px-4 py-3">{product.unitAbbreviation ?? "—"}</td>
                <td className="px-4 py-3 text-right tabular-nums">{product.totalQuantity}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(product)} disabled={locations.length === 0}>
                    <Pencil className="h-4 w-4" />
                    Update Qty
                  </Button>
                </td>
              </tr>
            ))}
            {visibleProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {products.length === 0 ? "Add a product before managing current stock." : "No stock matches these filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {locations.length === 0 && (
          <p className="border-t px-4 py-3 text-sm text-destructive">
            Add an active location before managing stock quantities.
          </p>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {visibleProducts.map((product) => (
          <article key={product.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold">{product.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{product.category ?? "Uncategorized"}</p>
              </div>
              <div className="shrink-0 rounded-lg bg-muted px-3 py-2 text-right">
                <p className="text-xl font-bold tabular-nums">{product.totalQuantity}</p>
                <p className="text-xs text-muted-foreground">{product.unitAbbreviation ?? "units"}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
              <p className="text-xs text-muted-foreground">Updated {formatDate(product.stockUpdatedAt)}</p>
              <Button type="button" variant="outline" size="sm" onClick={() => openEditDialog(product)} disabled={locations.length === 0}>
                <Pencil className="mr-1 h-4 w-4" /> Update
              </Button>
            </div>
          </article>
        ))}
        {visibleProducts.length === 0 && (
          <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">
            {products.length === 0 ? "Add a product before managing current stock." : "No stock matches these filters."}
          </p>
        )}
      </div>

      <AlertDialog open={isOpen} onOpenChange={(open) => !isSaving && setIsOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{mode === "add" ? "Add Stock" : "Update Product Quantity"}</AlertDialogTitle>
            <AlertDialogDescription>
              {mode === "add"
                ? "Select a product and enter the quantity to add at a location."
                : "Set the total quantity across locations. The difference will be applied to the selected location."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={productId || undefined} onValueChange={setProductId} disabled={isSaving || mode === "set"}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct && (
              <div className="grid grid-cols-2 gap-3 rounded-md bg-muted p-3 text-sm">
                <div><span className="text-muted-foreground">Category: </span>{selectedProduct.category ?? "—"}</div>
                <div><span className="text-muted-foreground">Unit: </span>{selectedProduct.unitAbbreviation ?? "—"}</div>
                <div className="col-span-2"><span className="text-muted-foreground">Current total: </span>{selectedProduct.totalQuantity}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Location for quantity change</Label>
              <Select value={locationId || undefined} onValueChange={setLocationId} disabled={true}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}{selectedProduct ? ` (current: ${selectedProduct.stockByLocation.find((stock) => stock.locationId === location.id)?.quantity ?? 0})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mode === "set" && (
                <p className="text-xs text-muted-foreground">
                  Selected location balance: {locationQuantity}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock-quantity">{mode === "add" ? "Quantity to add" : "New total quantity"}</Label>
              <Input
                id="stock-quantity"
                type="number"
                min={mode === "add" ? "0.0001" : "0"}
                step="0.0001"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <Button type="button" onClick={saveQuantity} disabled={isSaving || !productId || !locationId}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? "Saving..." : mode === "add" ? "Add Quantity" : "Save Quantity"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
