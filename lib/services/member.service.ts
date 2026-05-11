import { clerkClient } from "@clerk/nextjs/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";
import { inviteEmailHtml } from "@/lib/emails/invite";
import { writeAuditLog } from "@/lib/audit";
import {
  ConflictError,
  ForbiddenError,
  GoneError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type {
  ChangeMemberRoleInput,
  InviteMemberInput,
} from "@/lib/validations/member";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function listMembersByDivision(
  userId: string,
  divisionId: string,
) {
  if (!divisionId) {
    throw new ValidationError("divisionId is required");
  }

  const callerRole = await getUserRoleInDivision(userId, divisionId);
  if (!callerRole) {
    throw new ForbiddenError("Not a member of this division");
  }

  const [memberships, invitations] = await Promise.all([
    prisma.divisionMembership.findMany({
      where: { divisionId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: { divisionId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const client = await clerkClient();

  const members = await Promise.all(
    memberships.map(async (membership) => {
      let name = "Unknown";
      let email = "";
      let imageUrl: string | null = null;

      const dbUser = await prisma.user.findUnique({
        where: { clerkId: membership.clerkId },
        select: { name: true, email: true, imageUrl: true },
      });

      if (dbUser) {
        name = dbUser.name;
        email = dbUser.email;
        imageUrl = dbUser.imageUrl ?? null;
      } else {
        try {
          const clerkUser = await client.users.getUser(membership.clerkId);
          name =
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown";
          email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
          imageUrl = clerkUser.imageUrl ?? null;
        } catch {
          // Non-fatal fallback to default values.
        }
      }

      return {
        id: membership.id,
        clerkId: membership.clerkId,
        name,
        email,
        imageUrl,
        role: membership.role,
        createdAt: membership.createdAt,
      };
    }),
  );

  const pendingInvites = invitations.map((invitation) => ({
    id: invitation.id,
    email: invitation.email,
    role: invitation.role,
    expiresAt: invitation.expiresAt,
    createdAt: invitation.createdAt,
  }));

  return { members, pendingInvites };
}

export async function inviteMember(userId: string, input: InviteMemberInput) {
  const callerRole = await getUserRoleInDivision(userId, input.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can invite members");
  }

  if (input.role === "DIVISION_ADMIN" && callerRole !== "DIVISION_OWNER") {
    throw new ForbiddenError(
      "Only the division owner can assign the Admin role",
    );
  }

  const division = await prisma.division.findUnique({
    where: { id: input.divisionId },
    select: { name: true },
  });
  if (!division) {
    throw new NotFoundError("Division not found");
  }

  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({
    emailAddress: [input.email],
  });
  const clerkUser = clerkUsers[0];

  if (clerkUser) {
    const existingMembership = await prisma.divisionMembership.findUnique({
      where: {
        clerkId_divisionId: {
          clerkId: clerkUser.id,
          divisionId: input.divisionId,
        },
      },
    });
    if (existingMembership) {
      throw new ConflictError("User is already a member of this division");
    }

    await prisma.divisionMembership.create({
      data: {
        clerkId: clerkUser.id,
        divisionId: input.divisionId,
        role: input.role,
      },
    });

    try {
      await writeAuditLog({
        actorId: userId,
        action: "MEMBER_INVITE",
        resourceType: "MEMBER",
        resourceName: input.email,
        divisionId: input.divisionId,
      });
    } catch (error) {
      console.error("[inviteMember] audit log failed:", error);
    }

    return {
      status: "added" as const,
      message: "Member added directly",
    };
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.invitation.create({
    data: {
      email: input.email,
      divisionId: input.divisionId,
      role: input.role,
      token,
      invitedBy: userId,
      expiresAt,
    },
  });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${base.replace(/\/$/, "")}/accept-invite?token=${token}`;

  let inviterName = "Someone";
  try {
    const inviter = await client.users.getUser(userId);
    inviterName =
      `${inviter.firstName ?? ""} ${inviter.lastName ?? ""}`.trim() ||
      inviter.emailAddresses[0]?.emailAddress ||
      "Someone";
  } catch {
    // Non-fatal fallback.
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: [input.email],
    subject: "You've been invited to Otter",
    html: inviteEmailHtml({
      inviterName,
      divisionName: division.name,
      role: input.role,
      inviteUrl,
      expiresAt,
    }),
  });

  if (emailError) {
    console.error("[inviteMember] resend failed:", emailError);
  }

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_INVITE",
      resourceType: "MEMBER",
      resourceName: input.email,
      divisionId: input.divisionId,
    });
  } catch (error) {
    console.error("[inviteMember] audit log failed:", error);
  }

  return {
    status: "pending" as const,
    inviteUrl,
    emailFailed: !!emailError,
  };
}

export async function updateMemberRole(
  userId: string,
  membershipId: string,
  input: ChangeMemberRoleInput,
) {
  const membership = await prisma.divisionMembership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) {
    throw new NotFoundError("Membership not found");
  }

  const callerRole = await getUserRoleInDivision(userId, membership.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can change roles");
  }

  if (membership.role === "DIVISION_OWNER") {
    throw new ForbiddenError("Cannot change the division owner's role");
  }

  if (input.role === "DIVISION_ADMIN" && callerRole !== "DIVISION_OWNER") {
    throw new ForbiddenError(
      "Only the division owner can assign the Admin role",
    );
  }

  const oldRole = membership.role;
  const updated = await prisma.divisionMembership.update({
    where: { id: membershipId },
    data: { role: input.role },
  });

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_ROLE_CHANGE",
      resourceType: "MEMBER",
      resourceId: membership.clerkId,
      resourceName: membership.clerkId,
      divisionId: membership.divisionId,
      metadata: { oldValue: oldRole, newValue: input.role },
    });
  } catch (error) {
    console.error("[updateMemberRole] audit log failed:", error);
  }

  return updated;
}

export async function removeMember(userId: string, membershipId: string) {
  const membership = await prisma.divisionMembership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) {
    throw new NotFoundError("Membership not found");
  }

  const callerRole = await getUserRoleInDivision(userId, membership.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can remove members");
  }

  if (membership.role === "DIVISION_OWNER") {
    throw new ForbiddenError("Cannot remove the division owner");
  }

  await prisma.divisionMembership.delete({ where: { id: membershipId } });

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_REMOVE",
      resourceType: "MEMBER",
      resourceId: membership.clerkId,
      resourceName: membership.clerkId,
      divisionId: membership.divisionId,
    });
  } catch (error) {
    console.error("[removeMember] audit log failed:", error);
  }
}

export async function revokeInvitation(userId: string, invitationId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });
  if (!invitation) {
    throw new NotFoundError("Invitation not found");
  }

  const callerRole = await getUserRoleInDivision(userId, invitation.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can revoke invitations");
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED" },
  });
}

export async function acceptInvitation(userId: string, token: string) {
  if (!token) {
    throw new ValidationError("token is required");
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) {
    throw new NotFoundError("Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    if (invitation.status === "ACCEPTED") {
      throw new GoneError(
        "This invitation has already been accepted",
        "INVALID",
      );
    }
    throw new GoneError("This invitation has been revoked", "INVALID");
  }

  if (invitation.expiresAt < new Date()) {
    throw new GoneError("This invitation link has expired", "EXPIRED");
  }

  const existingMembership = await prisma.divisionMembership.findUnique({
    where: {
      clerkId_divisionId: {
        clerkId: userId,
        divisionId: invitation.divisionId,
      },
    },
  });

  if (existingMembership) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });
    return { divisionId: invitation.divisionId };
  }

  await prisma.$transaction([
    prisma.divisionMembership.create({
      data: {
        clerkId: userId,
        divisionId: invitation.divisionId,
        role: invitation.role,
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_INVITE",
      resourceType: "MEMBER",
      resourceName: invitation.email,
      divisionId: invitation.divisionId,
    });
  } catch (error) {
    console.error("[acceptInvitation] audit log failed:", error);
  }

  return { divisionId: invitation.divisionId };
}
