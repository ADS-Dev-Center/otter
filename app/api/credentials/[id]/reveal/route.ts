import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDomainError } from "@/lib/errors";
import { revealCredentialFields } from "@/lib/services/credential.service";

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
    const decryptedFields = await revealCredentialFields(userId, id);
    return NextResponse.json({ data: decryptedFields });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/credentials/[id]/reveal]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to reveal credential",
        },
      },
      { status: 500 },
    );
  }
}
