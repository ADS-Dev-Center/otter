"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  changeMemberRoleSchema,
  inviteMemberSchema,
} from "@/lib/validations/member";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  inviteMember,
  removeMember,
  revokeInvitation,
  updateMemberRole,
} from "@/lib/services/member.service";
import { actionFailure, actionSuccess, type ActionResult } from "./types";

export async function inviteMemberAction(input: {
  email: string;
  role: "DIVISION_ADMIN" | "MEMBER";
  divisionId: string;
}): Promise<ActionResult<Awaited<ReturnType<typeof inviteMember>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const data = await inviteMember(userId, parsed.data);
    revalidatePath("/members");
    return actionSuccess(data);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[inviteMemberAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to invite member");
  }
}

export async function changeMemberRoleAction(input: {
  membershipId: string;
  role: "DIVISION_ADMIN" | "MEMBER";
}): Promise<ActionResult<Awaited<ReturnType<typeof updateMemberRole>>>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  const parsed = changeMemberRoleSchema.safeParse({ role: input.role });
  if (!parsed.success) {
    return actionFailure(
      "VALIDATION_ERROR",
      "Validation failed",
      toFieldErrors(parsed.error),
    );
  }

  try {
    const membership = await updateMemberRole(
      userId,
      input.membershipId,
      parsed.data,
    );
    revalidatePath("/members");
    return actionSuccess(membership);
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[changeMemberRoleAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to update member role");
  }
}

export async function removeMemberAction(input: {
  membershipId: string;
}): Promise<ActionResult<{ membershipId: string }>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  try {
    await removeMember(userId, input.membershipId);
    revalidatePath("/members");
    return actionSuccess({ membershipId: input.membershipId });
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[removeMemberAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to remove member");
  }
}

export async function revokeInvitationAction(input: {
  invitationId: string;
}): Promise<ActionResult<{ invitationId: string }>> {
  const { userId } = await auth();
  if (!userId) return actionFailure("UNAUTHORIZED", "Unauthorized");

  try {
    await revokeInvitation(userId, input.invitationId);
    revalidatePath("/members");
    return actionSuccess({ invitationId: input.invitationId });
  } catch (error) {
    if (isDomainError(error)) {
      return actionFailure(error.code, error.message);
    }
    console.error("[revokeInvitationAction]", error);
    return actionFailure("INTERNAL_ERROR", "Failed to revoke invitation");
  }
}
