"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  createCredentialSchema,
  updateCredentialSchema,
} from "@/lib/validations/credential";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createCredential,
  deleteCredentialById,
  updateCredentialById,
} from "@/lib/services/credential.service";
import { actionFailure, actionSuccess, type ActionResult } from "./types";

export async function createCredentialAction(input: {
  name: string;
  environment: "production" | "staging" | "development" | "shared";
  projectId: string;
  fields: Array<{ key: string; value: string; secret: boolean }>;
}): Promise<ActionResult<Awaited<ReturnType<typeof createCredential>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = createCredentialSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const credential = await createCredential(userId, parsed.data);
    revalidatePath("/projects");
    return actionSuccess(credential);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[createCredentialAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to create credential");
  }
}

export async function updateCredentialAction(input: {
  credentialId: string;
  name?: string;
  environment?: "production" | "staging" | "development" | "shared";
  fields?: Array<{ key: string; value: string; secret: boolean }>;
}): Promise<ActionResult<Awaited<ReturnType<typeof updateCredentialById>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = updateCredentialSchema.safeParse({
    name: input.name,
    environment: input.environment,
    fields: input.fields,
  });
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const credential = await updateCredentialById(
      userId,
      input.credentialId,
      parsed.data,
    );
    revalidatePath("/projects");
    return actionSuccess(credential);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[updateCredentialAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to update credential");
  }
}

export async function deleteCredentialAction(input: {
  credentialId: string;
}): Promise<ActionResult<{ credentialId: string }>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  try {
    await deleteCredentialById(userId, input.credentialId);
    revalidatePath("/projects");
    return actionSuccess({ credentialId: input.credentialId });
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[deleteCredentialAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to delete credential");
  }
}
