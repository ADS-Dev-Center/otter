import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z
    .union([z.string().email("Must be a valid email"), z.literal("")])
    .optional()
    .default(""),
  role: z.enum(["DIVISION_ADMIN", "MEMBER"] as const),
  divisionId: z.string().min(1, "Division ID is required"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const changeMemberRoleSchema = z.object({
  role: z.enum(["DIVISION_ADMIN", "MEMBER"] as const),
});

export type ChangeMemberRoleInput = z.infer<typeof changeMemberRoleSchema>;
