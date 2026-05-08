import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const membershipCount = await prisma.divisionMembership.count({
    where: { clerkId: userId },
  });

  if (membershipCount === 0) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
