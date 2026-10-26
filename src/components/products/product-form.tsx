"use client";

import { useForm } from "react-hook-form";
import { createProduct, updateProduct } from "@/server/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  product?: Partial<{
    id: string;
    name: string;
    sku: string;
    barcode: string;
    description: string;
    costPrice: number;
    sellingPrice: number;
    reorderPoint: number;
    categoryId: string;
    brandId: string;
    unitId: string;
    imageUrl: string;
  }>;
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  units: { id: string; name: string; abbreviation: string }[];
}

export function ProductForm({ product, categories, brands, units }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product?.id;

  const form = useForm<any>({
    defaultValues: {
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      barcode: product?.barcode ?? "",
      description: product?.description ?? "",
      costPrice: product?.costPrice ?? 0,
      sellingPrice: product?.sellingPrice ?? 0,
      reorderPoint: product?.reorderPoint ?? 0,
      categoryId: product?.categoryId ?? "",
      brandId: product?.brandId ?? "",
      unitId: product?.unitId ?? "",
      imageUrl: product?.imageUrl ?? "",
    },
  });

  const nameError = typeof form.formState.errors.name?.message === "string" ? form.formState.errors.name.message : "";

  async function onSubmit(data: any) {
    const result = isEdit
      ? await updateProduct(product!.id!, data)
      : await createProduct(data);

    if (result.error) {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    } else {
      toast({ title: isEdit ? "Product updated" : "Product created" });
      router.push("/products");
      router.refresh();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" {...form.register("name")} />
          {nameError && <p className="text-xs text-destructive">{nameError}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku">SKU *</Label>
          <Input id="sku" {...form.register("sku")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <Input id="barcode" {...form.register("barcode")} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select onValueChange={(v) => form.setValue("categoryId", v)} defaultValue={product?.categoryId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Brand</Label>
          <Select onValueChange={(v) => form.setValue("brandId", v)} defaultValue={product?.brandId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
            <SelectContent>
              {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select onValueChange={(v) => form.setValue("unitId", v)} defaultValue={product?.unitId ?? ""}>
            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>
              {units.map((u) => <SelectItem key={u.id} value={u.id}>{u.name} ({u.abbreviation})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input id="costPrice" type="number" step="0.01" {...form.register("costPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price *</Label>
          <Input id="sellingPrice" type="number" step="0.01" {...form.register("sellingPrice", { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input id="reorderPoint" type="number" {...form.register("reorderPoint", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUpload
          value={form.watch("imageUrl")}
          onChange={(url) => form.setValue("imageUrl", url)}
          onRemove={() => form.setValue("imageUrl", "")}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
