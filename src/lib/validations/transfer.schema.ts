import { z } from "zod";

export const transferSchema = z.object({
  fromLocationId: z.string().min(1, "Source location is required"),
  toLocationId: z.string().min(1, "Destination location is required"),
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export type TransferInput = z.infer<typeof transferSchema>;
