import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AppShell from "@/components/layout/AppShell";
import { getDivisionMembershipCount } from "@/lib/services/division.service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const membershipCount = await getDivisionMembershipCount(userId);

  if (membershipCount === 0) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
