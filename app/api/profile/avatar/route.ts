import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const client = await clerkClient();
  const updated = await client.users.updateUserProfileImage(userId, { file });

  // optimistic DB sync
  await prisma.user.updateMany({
    where: { clerkId: userId },
    data: { imageUrl: updated.imageUrl },
  });

  return NextResponse.json({ imageUrl: updated.imageUrl });
}
