import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { encryptToString } from "@/lib/crypto";
import { createCredentialSchema } from "@/lib/validations/credential";
import { toSlug } from "@/lib/slug";
import { writeAuditLog } from "@/lib/audit";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const divisionIds = await getUserDivisionIds(userId);
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const divisionId = searchParams.get("divisionId");

  let projectFilter: { projectId?: string; project?: { divisionId: { in: string[] } } };

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { divisionId: true },
    });
    if (!project || !divisionIds.includes(project.divisionId)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not a member of this division" } },
        { status: 403 },
      );
    }
    projectFilter = { projectId };
  } else if (divisionId) {
    if (!divisionIds.includes(divisionId)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not a member of this division" } },
        { status: 403 },
      );
    }
    projectFilter = { project: { divisionId: { in: [divisionId] } } };
  } else {
    projectFilter = { project: { divisionId: { in: divisionIds } } };
  }

  const credentials = await prisma.credential.findMany({
    where: projectFilter,
    include: {
      fields: { select: { id: true, key: true, secret: true, credentialId: true } },
      project: { select: { id: true, name: true, divisionId: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: credentials });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await req.json();
  const result = createCredentialSchema.safeParse(body);
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

  const project = await prisma.project.findUnique({
    where: { id: result.data.projectId },
    select: { divisionId: true },
  });
  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 },
    );
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Only admins can create credentials" } },
      { status: 403 },
    );
  }

  if (result.data.fields.length > 200) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Cannot exceed 200 fields" } },
      { status: 400 },
    );
  }

  const slug = toSlug(result.data.name);

  try {
    const existing = await prisma.credential.findUnique({
      where: { projectId_slug: { projectId: result.data.projectId, slug } },
    });
    if (existing) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "A credential with this name already exists in this project" } },
        { status: 409 },
      );
    }

    const credential = await prisma.credential.create({
      data: {
        slug,
        name: result.data.name,
        environment: result.data.environment,
        projectId: result.data.projectId,
        fields: {
          create: result.data.fields.map((f) => ({
            key: f.key,
            encryptedValue: encryptToString(f.value),
            secret: f.secret,
          })),
        },
      },
      include: {
        fields: { select: { id: true, key: true, secret: true, credentialId: true } },
      },
    });

    await Promise.all([
      writeAuditLog({
        actorId: userId,
        action: "CREDENTIAL_CREATE",
        resourceType: "CREDENTIAL",
        resourceId: credential.id,
        resourceName: credential.name,
        credentialId: credential.id,
        divisionId: project.divisionId,
      }),
      prisma.project.update({
        where: { id: result.data.projectId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ data: credential }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/credentials]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create credential" } },
      { status: 500 },
    );
  }
}
