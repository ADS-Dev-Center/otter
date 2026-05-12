import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { changeMemberRoleSchema } from "@/lib/validations/member";
import { isDomainError, toFieldErrors } from "@/lib/errors";
import { removeMember, updateMemberRole } from "@/lib/services/member.service";

type Params = { params: Promise<{ membershipId: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { membershipId } = await params;
  const body: unknown = await req.json();
  const result = changeMemberRoleSchema.safeParse(body);
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
    const updated = await updateMemberRole(userId, membershipId, result.data);
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[PATCH /api/members/[membershipId]]", err);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update member role",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { membershipId } = await params;

  try {
    await removeMember(userId, membershipId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (isDomainError(err)) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }

    console.error("[DELETE /api/members/[membershipId]]", err);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to remove member" } },
      { status: 500 },
    );
  }
}
