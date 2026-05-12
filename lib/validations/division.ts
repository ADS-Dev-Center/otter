import { z } from "zod";

export const createDivisionSchema = z.object({
  name: z
    .string()
    .min(1, "Division name is required")
    .max(64, "Name must be 64 characters or less"),
});

export type CreateDivisionInput = z.infer<typeof createDivisionSchema>;
