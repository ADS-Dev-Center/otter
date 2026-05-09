import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDivisionSchema } from "@/lib/validations/division";
import { writeAuditLog } from "@/lib/audit";

type RouteContext = { params: Promise<{ id: string }> };

async function requireOwner(userId: string, divisionId: string) {
  const membership = await prisma.divisionMembership.findUnique({
    where: { clerkId_divisionId: { clerkId: userId, divisionId } },
  });
  if (!membership || membership.role !== "DIVISION_OWNER") return null;
  return membership;
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const membership = await requireOwner(userId, id);
  if (!membership) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only the division owner can rename it" } },
      { status: 403 },
    );
  }

  const body: unknown = await req.json();
  const result = createDivisionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: result.error.flatten().fieldErrors } },
      { status: 400 },
    );
  }

  const existing = await prisma.division.findUnique({ where: { id }, select: { name: true } });

  const division = await prisma.division.update({
    where: { id },
    data: { name: result.data.name },
  });

  await writeAuditLog({
    actorId: userId,
    action: "DIVISION_RENAME",
    resourceType: "DIVISION",
    resourceId: id,
    resourceName: division.name,
    divisionId: id,
    metadata: { oldValue: existing?.name, newValue: division.name },
  });

  return NextResponse.json({ data: division });
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const membership = await requireOwner(userId, id);
  if (!membership) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only the division owner can delete it" } },
      { status: 403 },
    );
  }

  // Guard: cannot delete if it is the user's only division
  const totalMemberships = await prisma.divisionMembership.count({
    where: { clerkId: userId },
  });
  if (totalMemberships <= 1) {
    return NextResponse.json(
      { error: { code: "LAST_DIVISION", message: "Cannot delete your only division" } },
      { status: 422 },
    );
  }

  const divisionToDelete = await prisma.division.findUnique({ where: { id }, select: { name: true } });

  await writeAuditLog({
    actorId: userId,
    action: "DIVISION_DELETE",
    resourceType: "DIVISION",
    resourceId: id,
    resourceName: divisionToDelete?.name ?? "Unknown",
    divisionId: id,
  });

  await prisma.division.delete({ where: { id } });

  return NextResponse.json({ data: { id } });
}
