import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { inviteMemberSchema } from "@/lib/validations/member";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import { inviteMember } from "@/lib/services/member.service";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await req.json();
  const result = inviteMemberSchema.safeParse(body);
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
    const data = await inviteMember(userId, result.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[POST /api/members/invite]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to invite member" } },
      { status: 500 },
    );
  }
}
