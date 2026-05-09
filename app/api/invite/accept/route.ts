import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "token is required" } },
      { status: 400 },
    );
  }

  const invitation = await prisma.invitation.findUnique({ where: { token } });

  if (!invitation) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Invitation not found" } },
      { status: 404 },
    );
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json(
      {
        error: {
          code: "INVALID",
          message:
            invitation.status === "ACCEPTED"
              ? "This invitation has already been accepted"
              : "This invitation has been revoked",
        },
      },
      { status: 410 },
    );
  }

  if (invitation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: { code: "EXPIRED", message: "This invitation link has expired" } },
      { status: 410 },
    );
  }

  const existingMembership = await prisma.divisionMembership.findUnique({
    where: { clerkId_divisionId: { clerkId: userId, divisionId: invitation.divisionId } },
  });
  if (existingMembership) {
    // Already a member — mark accepted and redirect cleanly
    await prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED" } });
    return NextResponse.json({ data: { divisionId: invitation.divisionId } });
  }

  await prisma.$transaction([
    prisma.divisionMembership.create({
      data: { clerkId: userId, divisionId: invitation.divisionId, role: invitation.role },
    }),
    prisma.invitation.update({ where: { id: invitation.id }, data: { status: "ACCEPTED" } }),
  ]);

  try {
    await writeAuditLog({
      actorId: userId,
      action: "MEMBER_INVITE",
      resourceType: "MEMBER",
      resourceName: invitation.email,
      divisionId: invitation.divisionId,
    });
  } catch (err) {
    console.error("[GET /api/invite/accept] audit log failed:", err);
  }

  return NextResponse.json({ data: { divisionId: invitation.divisionId } });
}
