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
import { Loader2 } from "lucide-react";

interface ProductFormValues {
  name: string;
  categoryId: string;
  unitId: string;
  costPrice: number;
  imageUrl: string;
}

interface ProductFormProps {
  product?: Partial<{
    id: string;
    name: string;
    costPrice: number;
    categoryId: string | null;
    unitId: string | null;
    imageUrl: string | null;
  }>;
  categories: { id: string; name: string }[];
  units: { id: string; name: string; abbreviation: string }[];
}

export function ProductForm({ product, categories, units }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEdit = !!product?.id;

  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: product?.name ?? "",
      categoryId: product?.categoryId ?? "",
      unitId: product?.unitId ?? "",
      costPrice: product?.costPrice ?? 0,
      imageUrl: product?.imageUrl ?? "",
    },
  });

  async function onSubmit(data: ProductFormValues) {
    try {
      const result = isEdit
        ? await updateProduct(product!.id!, data)
        : await createProduct(data);

      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
        return;
      }
      toast({ title: isEdit ? "Product updated" : "Product created" });
      router.push("/products");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "Could not save the product. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" disabled={form.formState.isSubmitting} {...form.register("name", { required: "Product name is required" })} />
          {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.watch("categoryId") || undefined}
            onValueChange={(value) => form.setValue("categoryId", value, { shouldDirty: true })}
            disabled={form.formState.isSubmitting || categories.length === 0}
          >
            <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {categories.length === 0 && <p className="text-xs text-muted-foreground">Add a category in Categories first.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select
            value={form.watch("unitId") || undefined}
            onValueChange={(value) => form.setValue("unitId", value, { shouldDirty: true })}
            disabled={form.formState.isSubmitting || units.length === 0}
          >
            <SelectTrigger id="unit"><SelectValue placeholder="Select unit" /></SelectTrigger>
            <SelectContent>
              {units.map((unit) => <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</SelectItem>)}
            </SelectContent>
          </Select>
          {units.length === 0 && <p className="text-xs text-muted-foreground">Add a unit in Units of Measure first.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price *</Label>
          <Input
            id="costPrice"
            type="number"
            min="0"
            step="0.01"
            disabled={form.formState.isSubmitting}
            {...form.register("costPrice", {
              valueAsNumber: true,
              required: "Cost price is required",
              min: { value: 0, message: "Cost price cannot be negative" },
            })}
          />
          {form.formState.errors.costPrice && <p className="text-xs text-destructive">{form.formState.errors.costPrice.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Image</Label>
        <ImageUpload
          value={form.watch("imageUrl")}
          onChange={(url) => form.setValue("imageUrl", url, { shouldDirty: true })}
          onRemove={() => form.setValue("imageUrl", "", { shouldDirty: true })}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {form.formState.isSubmitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={form.formState.isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
