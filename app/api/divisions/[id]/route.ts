import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDivisionSchema } from "@/lib/validations/division";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  deleteDivision,
  renameDivision,
} from "@/lib/services/division.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await req.json();
  const result = createDivisionSchema.safeParse(body);
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
    const { id } = await params;
    const division = await renameDivision(userId, id, result.data.name);
    return NextResponse.json({ data: division });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[PATCH /api/divisions/[id]]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to rename division" },
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
    await deleteDivision(userId, id);
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[DELETE /api/divisions/[id]]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to delete division" },
      },
      { status: 500 },
    );
  }
}
