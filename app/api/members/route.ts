import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isDomainError } from "@/lib/errors";
import { listMembersByDivision } from "@/lib/services/member.service";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  try {
    const data = await listMembersByDivision(userId, divisionId ?? "");
    return NextResponse.json({ data });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[GET /api/members]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch members" } },
      { status: 500 },
    );
  }
}
