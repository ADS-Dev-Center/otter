import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";
import { changeMemberRoleSchema } from "@/lib/validations/member";
import { writeAuditLog } from "@/lib/audit";

type Params = { params: Promise<{ membershipId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { membershipId } = await params;
  const body: unknown = await req.json();
  const result = changeMemberRoleSchema.safeParse(body);
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

  const membership = await prisma.divisionMembership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Membership not found" } },
      { status: 404 },
    );
  }

  const callerRole = await getUserRoleInDivision(userId, membership.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can change roles" } },
      { status: 403 },
    );
  }

  if (membership.role === "DIVISION_OWNER") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot change the division owner's role" } },
      { status: 403 },
    );
  }

  if (result.data.role === "DIVISION_ADMIN" && callerRole !== "DIVISION_OWNER") {
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

  const oldRole = membership.role;
  const updated = await prisma.divisionMembership.update({
    where: { id: membershipId },
    data: { role: result.data.role },
  });

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_ROLE_CHANGE",
      resourceType: "MEMBER",
      resourceId: membership.clerkId,
      resourceName: membership.clerkId,
      divisionId: membership.divisionId,
      metadata: { oldValue: oldRole, newValue: result.data.role },
    });
  } catch (err) {
    console.error("[PATCH /api/members/[membershipId]] audit log failed:", err);
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { membershipId } = await params;

  const membership = await prisma.divisionMembership.findUnique({
    where: { id: membershipId },
  });
  if (!membership) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Membership not found" } },
      { status: 404 },
    );
  }

  const callerRole = await getUserRoleInDivision(userId, membership.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can remove members" } },
      { status: 403 },
    );
  }

  if (membership.role === "DIVISION_OWNER") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Cannot remove the division owner" } },
      { status: 403 },
    );
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
  } catch (err) {
    console.error("[DELETE /api/members/[membershipId]] audit log failed:", err);
  }

  return new NextResponse(null, { status: 204 });
}
