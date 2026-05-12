import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(80, "Name must be 80 characters or less"),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
  divisionId: z.string().min(1, "Division ID is required"),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(80, "Name must be 80 characters or less")
    .optional(),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const createProjectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(80, "Name must be 80 characters or less"),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
});

export type CreateProjectFormInput = z.infer<typeof createProjectFormSchema>;

export const updateProjectFormSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(80, "Name must be 80 characters or less"),
  description: z
    .string()
    .max(300, "Description must be 300 characters or less")
    .optional(),
});

export type UpdateProjectFormInput = z.infer<typeof updateProjectFormSchema>;
