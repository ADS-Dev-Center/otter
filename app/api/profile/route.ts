import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { name: true, email: true, imageUrl: true, createdAt: true },
    });
    return NextResponse.json({
      name: user?.name ?? null,
      email: user?.email ?? null,
      imageUrl: user?.imageUrl ?? null,
      createdAt: user?.createdAt?.toISOString() ?? null,
    });
  } catch {
    console.error("[GET /api/profile] Failed to fetch profile");
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim();
  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const spaceIdx = name.indexOf(" ");
  const firstName = spaceIdx === -1 ? name : name.slice(0, spaceIdx);
  const lastName = spaceIdx === -1 ? "" : name.slice(spaceIdx + 1);

  const client = await clerkClient();
  try {
    await client.users.updateUser(userId, { firstName, lastName });
  } catch (err) {
    console.error("[PATCH /api/profile] clerk update failed:", err);
    return NextResponse.json(
      {
        error: {
          code: "CLERK_UPDATE_FAILED",
          message: "Failed to update account profile",
        },
      },
      { status: 500 },
    );
  }

  // optimistic DB sync so the UI is fresh before webhook fires
  await prisma.user.updateMany({
    where: { clerkId: userId },
    data: { name },
  });

  return NextResponse.json({ ok: true });
}
