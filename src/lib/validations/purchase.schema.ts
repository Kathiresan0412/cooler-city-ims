import { z } from "zod";

export const grnSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  locationId: z.string().min(1, "Location is required"),
  items: z.array(z.object({ productId: z.string(), quantity: z.coerce.number().min(1) })).min(1),
});

export type GRNInput = z.infer<typeof grnSchema>;
