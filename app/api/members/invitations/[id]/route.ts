import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;

  const invitation = await prisma.invitation.findUnique({ where: { id } });
  if (!invitation) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Invitation not found" } },
      { status: 404 },
    );
  }

  const callerRole = await getUserRoleInDivision(userId, invitation.divisionId);
  if (callerRole !== "DIVISION_OWNER" && callerRole !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can revoke invitations" } },
      { status: 403 },
    );
  }

  await prisma.invitation.update({
    where: { id },
    data: { status: "REVOKED" },
  });

  return new NextResponse(null, { status: 204 });
}
