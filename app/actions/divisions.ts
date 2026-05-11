"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createDivisionSchema } from "@/lib/validations/division";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createDivision,
  deleteDivision,
  renameDivision,
} from "@/lib/services/division.service";
import { actionFailure, actionSuccess, type ActionResult } from "./types";

export async function createDivisionAction(input: {
  name: string;
}): Promise<ActionResult<Awaited<ReturnType<typeof createDivision>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = createDivisionSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const division = await createDivision(userId, parsed.data);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return actionSuccess(division);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[createDivisionAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to create division");
  }
}

export async function renameDivisionAction(input: {
  divisionId: string;
  name: string;
}): Promise<ActionResult<Awaited<ReturnType<typeof renameDivision>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = createDivisionSchema.safeParse({ name: input.name });
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const division = await renameDivision(
      userId,
      input.divisionId,
      parsed.data.name,
    );
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return actionSuccess(division);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[renameDivisionAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to rename division");
  }
}

export async function deleteDivisionAction(input: {
  divisionId: string;
}): Promise<ActionResult<{ divisionId: string }>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  try {
    await deleteDivision(userId, input.divisionId);
    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return actionSuccess({ divisionId: input.divisionId });
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[deleteDivisionAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to delete division");
  }
}
