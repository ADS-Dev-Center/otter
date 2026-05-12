"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createProjectSchema,
  updateProjectSchema,
} from "@/lib/validations/project";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createProjectForDivision,
  deleteProjectById,
  updateProjectById,
} from "@/lib/services/project.service";
import { actionFailure, actionSuccess, type ActionResult } from "./types";

export async function createProjectAction(input: {
  name: string;
  description?: string;
  divisionId: string;
}): Promise<
  ActionResult<Awaited<ReturnType<typeof createProjectForDivision>>>
> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = createProjectSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const project = await createProjectForDivision(userId, parsed.data);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return actionSuccess(project);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[createProjectAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to create project");
  }
}

export async function updateProjectAction(input: {
  projectId: string;
  name?: string;
  description?: string;
}): Promise<ActionResult<Awaited<ReturnType<typeof updateProjectById>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = updateProjectSchema.safeParse({
    name: input.name,
    description: input.description,
  });
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const project = await updateProjectById(
      userId,
      input.projectId,
      parsed.data,
    );
    revalidatePath("/projects");
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/dashboard");
    return actionSuccess(project);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[updateProjectAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to update project");
  }
}

export async function deleteProjectAction(input: {
  projectId: string;
}): Promise<ActionResult<{ projectId: string }>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  try {
    await deleteProjectById(userId, input.projectId);
    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return actionSuccess({ projectId: input.projectId });
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[deleteProjectAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to delete project");
  }
}
