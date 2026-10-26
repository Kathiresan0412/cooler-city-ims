import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: z.string().optional(),
  price: z.coerce.number().nonnegative().optional(),
  cost: z.coerce.number().nonnegative().optional(),
  reorderLevel: z.coerce.number().nonnegative().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
