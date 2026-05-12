import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { updateCredentialSchema } from "@/lib/validations/credential";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import {
  deleteCredentialById,
  getCredentialById,
  updateCredentialById,
} from "@/lib/services/credential.service";

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

  try {
    const { id } = await params;
    const credential = await getCredentialById(userId, id);
    return NextResponse.json({ data: credential });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/credentials/[id]]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch credential",
        },
      },
      { status: 500 },
    );
  }
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

  const body: unknown = await req.json();
  const result = updateCredentialSchema.safeParse(body);
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
    const updated = await updateCredentialById(userId, id, result.data);

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[PUT /api/credentials/[id]]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update credential",
        },
      },
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

  try {
    const { id } = await params;
    await deleteCredentialById(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[DELETE /api/credentials/[id]]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete credential",
        },
      },
      { status: 500 },
    );
  }
}
