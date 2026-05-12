import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createProjectSchema } from "@/lib/validations/project";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createProjectForDivision,
  listProjectsForUser,
} from "@/lib/services/project.service";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const divisionId = searchParams.get("divisionId");

    const projects = await listProjectsForUser(userId, divisionId);

    return NextResponse.json({ data: projects });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

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
          fieldErrors: toFieldErrors(result.error),
        },
      },
      { status: 400 },
    );
  }

  try {
    const project = await createProjectForDivision(userId, result.data);

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[POST /api/projects]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create project" },
      },
      { status: 500 },
    );
  }
}
