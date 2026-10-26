import { z } from "zod";

export const adjustmentSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  locationId: z.string().min(1, "Location is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  reason: z.string().optional(),
});

export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
