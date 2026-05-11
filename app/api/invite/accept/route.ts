import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDomainError } from "@/lib/errors";
import { acceptInvitation } from "@/lib/services/member.service";

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
    const token = searchParams.get("token") ?? "";
    const data = await acceptInvitation(userId, token);
    return NextResponse.json({ data });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/invite/accept]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to accept invitation",
        },
      },
      { status: 500 },
    );
  }
}
