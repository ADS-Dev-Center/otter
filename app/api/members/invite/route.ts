import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";
import { inviteMemberSchema } from "@/lib/validations/member";
import { inviteEmailHtml } from "@/lib/emails/invite";
import { writeAuditLog } from "@/lib/audit";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await req.json();
  const result = inviteMemberSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          fieldErrors: result.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const { email, role, divisionId } = result.data;

  const callerRole = await getUserRoleInDivision(userId, divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    return NextResponse.json(
      {
        error: { code: "FORBIDDEN", message: "Only admins can invite members" },
      },
      { status: 403 },
    );
  }

  if (role === "DIVISION_ADMIN" && callerRole !== "DIVISION_OWNER") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Only the division owner can assign the Admin role",
        },
      },
      { status: 403 },
    );
  }

  const client = await clerkClient();
  const { data: clerkUsers } = await client.users.getUserList({
    emailAddress: [email],
  });
  const clerkUser = clerkUsers[0];

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { name: true },
  });
  if (!division) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Division not found" } },
      { status: 404 },
    );
  }

  // Path A — user already has an Otter account
  if (clerkUser) {
    const existingMembership = await prisma.divisionMembership.findUnique({
      where: {
        clerkId_divisionId: { clerkId: clerkUser.id, divisionId },
      },
    });
    if (existingMembership) {
      return NextResponse.json(
        {
          error: {
            code: "CONFLICT",
            message: "User is already a member of this division",
          },
        },
        { status: 409 },
      );
    }

    await prisma.divisionMembership.create({
      data: { clerkId: clerkUser.id, divisionId, role },
    });

    try {
      await writeAuditLog({
        actorId: userId,
        action: "MEMBER_INVITE",
        resourceType: "MEMBER",
        resourceName: email,
        divisionId,
      });
    } catch (err) {
      console.error("[POST /api/members/invite] audit log failed:", err);
    }

    return NextResponse.json(
      { data: { status: "added", message: "Member added directly" } },
      { status: 201 },
    );
  }

  // Path B — user does not have an Otter account
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const invitation = await prisma.invitation.create({
    data: { email, divisionId, role, token, invitedBy: userId, expiresAt },
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
    // non-fatal
  }

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: [email],
    subject: "You've been invited to Otter",
    html: inviteEmailHtml({
      inviterName,
      divisionName: division.name,
      role,
      inviteUrl,
      expiresAt,
    }),
  });

  if (emailError) {
    console.error("[POST /api/members/invite] resend failed:", emailError);
  }

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_INVITE",
      resourceType: "MEMBER",
      resourceName: email,
      divisionId,
    });
  } catch (err) {
    console.error("[POST /api/members/invite] audit log failed:", err);
  }

  return NextResponse.json(
    {
      data: {
        status: "pending",
        inviteUrl,
        emailFailed: !!emailError,
      },
    },
    { status: 201 },
  );
}
