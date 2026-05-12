import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createDivisionSchema } from "@/lib/validations/division";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createDivision,
  listDivisionsForUser,
} from "@/lib/services/division.service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  try {
    const divisions = await listDivisionsForUser(userId);
    return NextResponse.json({ data: divisions });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/divisions]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to fetch divisions" },
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
    const division = await createDivision(userId, result.data);
    return NextResponse.json({ data: division }, { status: 201 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[POST /api/divisions]", err);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create division" },
      },
      { status: 500 },
    );
  }
}
