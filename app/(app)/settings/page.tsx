import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { listDivisionsForUser } from "@/lib/services/division.service";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, divisions] = await Promise.all([
    prisma.user.findUnique({
      where: { clerkId: userId },
      select: { name: true, email: true, imageUrl: true, createdAt: true },
    }),
    listDivisionsForUser(userId),
  ]);

  const profile = user
    ? {
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
        createdAt: user.createdAt.toISOString(),
      }
    : null;

  return <SettingsView initialProfile={profile} initialDivisions={divisions} />;
}
