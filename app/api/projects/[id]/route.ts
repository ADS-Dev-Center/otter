import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateProjectSchema } from "@/lib/validations/project";
import { isDomainError, MalformedJsonError, toFieldErrors } from "@/lib/errors";
import {
  deleteProjectById,
  updateProjectById,
} from "@/lib/services/project.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  try {
    const body: unknown = await req.json().catch(() => {
      throw new MalformedJsonError();
    });
    const result = updateProjectSchema.safeParse(body);
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

    const { id } = await params;
    const updated = await updateProjectById(userId, id, result.data);

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
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

  try {
    const { id } = await params;
    await deleteProjectById(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[DELETE /api/projects/[id]]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to delete project" },
      },
      { status: 500 },
    );
  }
}
