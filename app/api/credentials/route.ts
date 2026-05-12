import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createCredentialSchema } from "@/lib/validations/credential";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  createCredential,
  listCredentialsForUser,
} from "@/lib/services/credential.service";

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
    const credentials = await listCredentialsForUser(userId, {
      projectId: searchParams.get("projectId"),
      divisionId: searchParams.get("divisionId"),
    });
    return NextResponse.json({ data: credentials });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/credentials]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch credentials",
        },
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
  const result = createCredentialSchema.safeParse(body);
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
    const credential = await createCredential(userId, result.data);

    return NextResponse.json({ data: credential }, { status: 201 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[POST /api/credentials]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create credential",
        },
      },
      { status: 500 },
    );
  }
}
