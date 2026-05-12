import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDomainError } from "@/lib/errors";
import { revokeInvitation } from "@/lib/services/member.service";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;

  try {
    await revokeInvitation(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[DELETE /api/members/invitations/[id]]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to revoke invitation",
        },
      },
      { status: 500 },
    );
  }
}
