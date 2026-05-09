import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";
import { updateProjectSchema } from "@/lib/validations/project";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 },
    );
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (
    role !== "DIVISION_OWNER" &&
    role !== "DIVISION_ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Only admins can update projects",
        },
      },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await req.json();
    const result = updateProjectSchema.safeParse(body);
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

    const updated = await prisma.project.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.error("[PATCH /api/projects/[id]] JSON parse error:", err);
      return NextResponse.json(
        {
          error: {
            code: "MALFORMED_JSON",
            message: "Invalid JSON in request body",
          },
        },
        { status: 400 },
      );
    }
    console.error("[PATCH /api/projects/[id]]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update project" },
      },
      { status: 500 },
    );
  }
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
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Project not found" } },
      { status: 404 },
    );
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (role !== "DIVISION_OWNER" && role !== "SUPER_ADMIN") {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Only the division owner can delete projects",
        },
      },
      { status: 403 },
    );
  }

  try {
    await prisma.project.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to delete project" },
      },
      { status: 500 },
    );
  }
}
