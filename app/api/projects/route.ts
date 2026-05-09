import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  try {
    const divisionIds = await getUserDivisionIds(userId);
    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get("divisionId");

    let filteredIds = divisionIds;
    if (divisionId) {
      if (!divisionIds.includes(divisionId)) {
        return NextResponse.json(
          {
            error: {
              code: "FORBIDDEN",
              message: "Not a member of this division",
            },
          },
          { status: 403 },
        );
      }
      filteredIds = [divisionId];
    }

    const projects = await prisma.project.findMany({
      where: { divisionId: { in: filteredIds } },
      include: { _count: { select: { credentials: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: projects });
  } catch (err) {
    console.error("[GET /api/projects]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch projects" },
      },
      { status: 500 },
    );
  }
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
  const result = createProjectSchema.safeParse(body);
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

  const role = await getUserRoleInDivision(userId, result.data.divisionId);
  if (
    role !== "DIVISION_OWNER" &&
    role !== "DIVISION_ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Only admins can create projects",
        },
      },
      { status: 403 },
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        environment: result.data.environment,
        divisionId: result.data.divisionId,
      },
      include: { _count: { select: { credentials: true } } },
    });
    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/projects]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create project" },
      },
      { status: 500 },
    );
  }
}
