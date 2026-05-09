import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { encryptToString } from "@/lib/crypto";
import { updateCredentialSchema } from "@/lib/validations/credential";

async function resolveCredential(id: string, userId: string) {
  const credential = await prisma.credential.findUnique({
    where: { id },
    include: {
      project: { select: { divisionId: true } },
      fields: { select: { id: true, key: true, secret: true, credentialId: true } },
    },
  });
  if (!credential) return { credential: null, role: null, divisionId: null };

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(credential.project.divisionId)) {
    return { credential: null, role: null, divisionId: null };
  }

  const role = await getUserRoleInDivision(userId, credential.project.divisionId);
  return { credential, role, divisionId: credential.project.divisionId };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const { credential } = await resolveCredential(id, userId);
  if (!credential) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Credential not found" } },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: credential });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const { credential, role, divisionId } = await resolveCredential(id, userId);
  if (!credential) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Credential not found" } },
      { status: 404 },
    );
  }

  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can update credentials" } },
      { status: 403 },
    );
  }

  const body: unknown = await req.json();
  const result = updateCredentialSchema.safeParse(body);
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

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (result.data.fields !== undefined) {
        await tx.credentialField.deleteMany({ where: { credentialId: id } });
        await tx.credentialField.createMany({
          data: result.data.fields.map((f) => ({
            key: f.key,
            encryptedValue: encryptToString(f.value),
            secret: f.secret ?? false,
            credentialId: id,
          })),
        });
      }

      return tx.credential.update({
        where: { id },
        data: {
          ...(result.data.name !== undefined && { name: result.data.name }),
          ...(result.data.environment !== undefined && { environment: result.data.environment }),
        },
        include: {
          fields: { select: { id: true, key: true, secret: true, credentialId: true } },
        },
      });
    });

    await Promise.all([
      prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "CREDENTIAL_UPDATE",
          credentialId: id,
          divisionId,
        },
      }),
      prisma.project.update({
        where: { id: credential.projectId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("[PUT /api/credentials/[id]]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update credential" } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const { credential, role, divisionId } = await resolveCredential(id, userId);
  if (!credential) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Credential not found" } },
      { status: 404 },
    );
  }

  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can delete credentials" } },
      { status: 403 },
    );
  }

  try {
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "CREDENTIAL_DELETE",
        credentialId: id,
        divisionId,
        metadata: { name: credential.name },
      },
    });

    await prisma.credential.delete({ where: { id } });

    await prisma.project.update({
      where: { id: credential.projectId },
      data: { updatedAt: new Date() },
    });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/credentials/[id]]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete credential" } },
      { status: 500 },
    );
  }
}
