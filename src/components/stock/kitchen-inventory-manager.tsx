"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowUpDown, ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CategoryDateFilters } from "@/components/shared/category-date-filters";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { completeKitchenIssue, issueToKitchen, returnFromKitchen } from "@/server/actions/kitchen-inventory.actions";
import { getProductImageSrc } from "@/lib/product-image";

interface ProductOption {
  id: string;
  name: string;
  imageUrl: string | null;
  unitAbbreviation: string | null;
  availableQuantity: number;
}

interface UserOption {
  id: string;
  name: string | null;
  email: string;
}

interface KitchenIssueRow {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  category: string | null;
  unitAbbreviation: string | null;
  locationName: string;
  receiverName: string;
  issuedQuantity: number;
  returnedQuantity: number;
  remainingQuantity: number;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
}

interface KitchenInventoryManagerProps {
  products: ProductOption[];
  users: UserOption[];
  warehouse: { id: string; name: string } | null;
  issues: KitchenIssueRow[];
}

export function KitchenInventoryManager({ products, users, warehouse, issues }: KitchenInventoryManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [productId, setProductId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [historyProductId, setHistoryProductId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState<"category" | "date">("date");
  const [sortDescending, setSortDescending] = useState(true);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const categories = useMemo(
    () => [...new Set(issues.map((issue) => issue.category).filter((value): value is string => Boolean(value)))].sort(),
    [issues],
  );
  const visibleIssues = useMemo(() => issues
    .filter((issue) => !historyProductId || issue.productId === historyProductId)
    .filter((issue) => !categoryFilter || issue.category === categoryFilter)
    .filter((issue) => {
      const date = issue.createdAt.toISOString().slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    })
    .sort((a, b) => {
      const comparison = sortField === "date"
        ? a.createdAt.getTime() - b.createdAt.getTime()
        : (a.category ?? "").localeCompare(b.category ?? "");
      return sortDescending ? -comparison : comparison;
    }), [issues, historyProductId, categoryFilter, fromDate, toDate, sortField, sortDescending]);
  const openProductIds = useMemo(
    () => new Set(issues.filter((issue) => !issue.completedAt && issue.remainingQuantity > 0).map((issue) => issue.productId)),
    [issues],
  );
  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLocaleLowerCase();
    return products.filter((product) => product.name.toLocaleLowerCase().includes(search));
  }, [products, productSearch]);

  function toggleSort(field: "category" | "date") {
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
  const selectedReceiver = users.find((user) => user.id === receiverId);
  const availableQuantity = selectedProduct?.availableQuantity ?? 0;
  const selectedProductHasOpenIssue = Boolean(productId && openProductIds.has(productId));

  async function handleIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedQuantity = Number(quantity);
    if (!productId || !selectedReceiver || !quantity.trim() || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast({ title: "Missing or invalid information", description: "Select a product, select who will receive it, and enter a quantity greater than zero.", variant: "destructive" });
      return;
    }
    if (parsedQuantity > availableQuantity) {
      toast({ title: "Not enough stock", description: `Only ${availableQuantity} is available in the main warehouse.`, variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await issueToKitchen({
        productId,
        receiverName: selectedReceiver.name?.trim() || selectedReceiver.email,
        quantity: parsedQuantity,
        notes,
      });
      if (!result.success) {
        toast({ title: "Could not issue stock", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Stock issued to kitchen" });
      setHistoryProductId(productId);
      setProductId("");
      setReceiverId("");
      setQuantity("");
      setNotes("");
      setIncludeNotes(false);
      router.refresh();
    } catch {
      toast({ title: "Could not issue stock", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComplete(issue: KitchenIssueRow) {
    if (!window.confirm(`Complete this issue for ${issue.productName}? The remaining ${issue.remainingQuantity} will be recorded as used and cannot be returned.`)) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await completeKitchenIssue({ issueId: issue.id });
      if (!result.success) {
        toast({ title: "Could not complete kitchen issue", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Kitchen issue completed", description: "The remaining quantity was recorded as used." });
      router.refresh();
    } catch {
      toast({ title: "Could not complete kitchen issue", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReturn(issueId: string) {
    const parsedQuantity = Number(returnQuantities[issueId]);
    const issue = issues.find((entry) => entry.id === issueId);
    if (!issue || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      toast({ title: "Invalid return quantity", description: "Enter a quantity greater than zero.", variant: "destructive" });
      return;
    }
    if (parsedQuantity > issue.remainingQuantity) {
      toast({ title: "Return exceeds outstanding quantity", description: `Only ${issue.remainingQuantity} can be returned for this issue.`, variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const result = await returnFromKitchen({ issueId, quantity: parsedQuantity });
      if (!result.success) {
        toast({ title: "Could not return stock", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: "Kitchen stock returned" });
      setReturnQuantities((current) => ({ ...current, [issueId]: "" }));
      router.refresh();
    } catch {
      toast({ title: "Could not return stock", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-md border p-4">
        <h2 className="text-lg font-semibold">Issue stock to kitchen</h2>
        <form onSubmit={handleIssue} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="kitchen-product">Product</Label>
            <Popover
              open={productPickerOpen}
              onOpenChange={(open) => {
                setProductPickerOpen(open);
                if (!open) setProductSearch("");
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  id="kitchen-product"
                  type="button"
                  variant="outline"
                  aria-haspopup="dialog"
                  aria-expanded={productPickerOpen}
                  aria-label="Select product"
                  disabled={isSaving}
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedProduct ? (
                    <>
                      {selectedProduct.imageUrl ? (
                        <Image
                          src={getProductImageSrc(selectedProduct.imageUrl)}
                          alt=""
                          width={32}
                          height={32}
                          unoptimized
                          className="h-8 w-8 rounded object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="truncate">{selectedProduct.name}</span>
                    </>
                  ) : "Select product"}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                <div className="border-b p-2">
                  <Input
                    autoFocus
                    aria-label="Search products"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    className="h-9"
                  />
                </div>
                <div aria-label="Products" className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto p-2">
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      aria-pressed={product.id === productId}
                      onClick={() => {
                        setProductId(product.id);
                        setHistoryProductId(product.id);
                        setProductPickerOpen(false);
                        setProductSearch("");
                      }}
                      className={`flex min-w-0 flex-col items-center gap-2 rounded-md border p-3 text-center text-sm hover:bg-accent focus:bg-accent focus:outline-none ${
                        product.id === productId ? "border-primary bg-accent" : "border-border"
                      }`}
                    >
                      {product.imageUrl ? (
                        <Image
                          src={getProductImageSrc(product.imageUrl)}
                          alt=""
                          width={96}
                          height={96}
                          unoptimized
                          className="h-24 w-24 rounded-md bg-muted object-cover"
                        />
                      ) : (
                        <span className="flex h-24 w-24 items-center justify-center rounded-md bg-muted">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        </span>
                      )}
                      <span className="line-clamp-2 w-full break-words">{product.name}</span>
                      {openProductIds.has(product.id) && (
                        <span className="text-xs font-medium text-muted-foreground">Open issue</span>
                      )}
                    </button>
                  )) : (
                    <p className="col-span-2 px-2 py-3 text-center text-sm text-muted-foreground">No products found.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kitchen-receiver">Received by</Label>
            <Select value={receiverId || undefined} onValueChange={setReceiverId} disabled={isSaving}>
              <SelectTrigger id="kitchen-receiver"><SelectValue placeholder="Select a user" /></SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name?.trim() ? `${user.name.trim()} ` : user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="kitchen-quantity">Quantity</Label>
            <Input
              id="kitchen-quantity"
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              disabled={isSaving}
            />
            {selectedProduct && (
              <p className="text-xs text-muted-foreground">
                Main warehouse available: {availableQuantity} {selectedProduct.unitAbbreviation ?? ""}
              </p>
            )}
            {selectedProductHasOpenIssue && (
              <p className="text-xs text-destructive">
                This product already has an open issue. Complete or return it before issuing more.
              </p>
            )}
          </div>
          <div className="space-y-2 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="kitchen-include-notes"
                checked={includeNotes}
                onCheckedChange={(checked) => {
                  const shouldIncludeNotes = checked === true;
                  setIncludeNotes(shouldIncludeNotes);
                  if (!shouldIncludeNotes) setNotes("");
                }}
                disabled={isSaving}
              />
              <Label htmlFor="kitchen-include-notes">Add a note (optional)</Label>
            </div>
            {includeNotes && (
              <Input
                id="kitchen-notes"
                aria-label="Notes"
                maxLength={500}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Enter a note"
                disabled={isSaving}
              />
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Button
              type="submit"
              disabled={isSaving || products.length === 0 || users.length === 0 || !warehouse || selectedProductHasOpenIssue}
            >
              {isSaving ? "Saving..." : "Issue to Kitchen"}
            </Button>
          </div>
        </form>
        <p className="mt-3 text-sm text-muted-foreground">
          Stock is always issued from {warehouse?.name ?? "the main warehouse"}.
        </p>
        {(products.length === 0 || users.length === 0 || !warehouse) && (
          <p className="mt-3 text-sm text-destructive">
            {products.length === 0
              ? "Add an active product before issuing stock."
              : users.length === 0
                ? "Add an active user before issuing stock."
                : "Configure an active Main Warehouse (location code WH-MAIN) before issuing stock."}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Kitchen issue history</h2>
        <Select
          value={historyProductId || "__all_kitchen_products__"}
          onValueChange={(value) => setHistoryProductId(value === "__all_kitchen_products__" ? "" : value)}
        >
          <SelectTrigger aria-label="Filter kitchen issues by product" className="w-full sm:w-64">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all_kitchen_products__">All products</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <CategoryDateFilters
          categories={categories}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
          fromDate={fromDate}
          onFromDateChange={setFromDate}
          toDate={toDate}
          onToDateChange={setToDate}
        />
        <div className="hidden overflow-x-auto rounded-md border md:block">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <Button variant="ghost" size="sm" onClick={() => toggleSort("date")}>
                    Date <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">
                  <Button variant="ghost" size="sm" onClick={() => toggleSort("category")}>
                    Category <ArrowUpDown className="ml-1 h-3 w-3" />
                  </Button>
                </th>
                <th className="px-4 py-3 text-left font-medium">Received by</th>
                {/* <th className="px-4 py-3 text-left font-medium">Location</th> */}
                <th className="px-4 py-3 text-right font-medium">Issued</th>
                <th className="px-4 py-3 text-right font-medium">Returned</th>
                <th className="px-4 py-3 text-right font-medium">Outstanding</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
                <th className="px-4 py-3 text-left font-medium">Actions / Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleIssues.map((issue) => (
                <tr key={issue.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{formatDate(issue.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{issue.productName}</div>
                    {/* <div className="text-xs text-muted-foreground">{issue.sku}</div> */}
                  </td>
                  <td className="px-4 py-3">{issue.category ?? "—"}</td>
                  <td className="px-4 py-3">{issue.receiverName}</td>
                  {/* <td className="px-4 py-3">{issue.locationName}</td> */}
                  <td className="px-4 py-3 text-right tabular-nums">{issue.issuedQuantity} {issue.unitAbbreviation ?? ""}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{issue.returnedQuantity}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{issue.remainingQuantity}</td>
                  <td className="px-4 py-3">{issue.notes || "—"}</td>
                  <td className="px-4 py-3">
                    {issue.completedAt ? (
                      <span className="text-muted-foreground">Complete · used {issue.issuedQuantity - issue.returnedQuantity}</span>
                    ) : issue.remainingQuantity > 0 ? (
                      <div className="flex items-center gap-2">
                        <Input
                          aria-label={`Return quantity for ${issue.productName}`}
                          className="w-24"
                          type="number"
                          min="0.0001"
                          max={issue.remainingQuantity}
                          step="0.0001"
                          value={returnQuantities[issue.id] ?? ""}
                          onChange={(event) => setReturnQuantities((current) => ({ ...current, [issue.id]: event.target.value }))}
                          disabled={isSaving}
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => handleReturn(issue.id)} disabled={isSaving}>
                          Return
                        </Button>
                        <Button type="button" size="sm" onClick={() => handleComplete(issue)} disabled={isSaving}>
                          Complete
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Returned</span>
                    )}
                  </td>
                </tr>
              ))}
              {visibleIssues.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                  {issues.length === 0 ? "No kitchen issues yet." : "No kitchen issues match these filters."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {visibleIssues.map((issue) => (
            <article key={issue.id} className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold">{issue.productName}</h3>
                  <p className="text-xs text-muted-foreground">{issue.sku} · {issue.category ?? "Uncategorized"}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-muted px-3 py-2 text-sm font-semibold tabular-nums">
                  {issue.completedAt ? "Completed" : issue.remainingQuantity > 0 ? `${issue.remainingQuantity} left` : "Returned"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t pt-3 text-sm">
                <div><span className="text-muted-foreground">Issued </span>{issue.issuedQuantity} {issue.unitAbbreviation ?? ""}</div>
                <div><span className="text-muted-foreground">Returned </span>{issue.returnedQuantity}</div>
                <div><span className="text-muted-foreground">Received by </span>{issue.receiverName}</div>
                <div><span className="text-muted-foreground">Location </span>{issue.locationName}</div>
                <div className="col-span-2 text-muted-foreground">{formatDate(issue.createdAt)}{issue.notes ? ` · ${issue.notes}` : ""}</div>
              </div>
              {issue.completedAt ? (
                <p className="border-t pt-3 text-sm text-muted-foreground">
                  Complete · used {issue.issuedQuantity - issue.returnedQuantity}
                </p>
              ) : issue.remainingQuantity > 0 ? (
                <div className="flex gap-2 border-t pt-3">
                  <Input
                    aria-label={`Return quantity for ${issue.productName}`}
                    type="number"
                    min="0.0001"
                    max={issue.remainingQuantity}
                    step="0.0001"
                    value={returnQuantities[issue.id] ?? ""}
                    onChange={(event) => setReturnQuantities((current) => ({ ...current, [issue.id]: event.target.value }))}
                    disabled={isSaving}
                  />
                  <Button type="button" variant="outline" onClick={() => handleReturn(issue.id)} disabled={isSaving}>Return</Button>
                  <Button type="button" onClick={() => handleComplete(issue)} disabled={isSaving}>Complete</Button>
                </div>
              ) : <p className="border-t pt-3 text-sm text-muted-foreground">Returned</p>}
            </article>
          ))}
          {visibleIssues.length === 0 && <p className="rounded-xl border px-4 py-8 text-center text-sm text-muted-foreground">{issues.length === 0 ? "No kitchen issues yet." : "No kitchen issues match these filters."}</p>}
        </div>
      </section>
    </div>
  );
}
