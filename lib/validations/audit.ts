import { z } from "zod";

export const auditQuerySchema = z.object({
  divisionId: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  dateRange: z.enum(["24h", "7d", "30d", "all"]).default("30d"),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  perPage: z.coerce.number().int().positive().max(100).default(15),
});

export type AuditQuery = z.infer<typeof auditQuerySchema>;
