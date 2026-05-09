import { prisma } from "@/lib/prisma";

export async function getUserDivisionIds(clerkId: string): Promise<string[]> {
  const memberships = await prisma.divisionMembership.findMany({
    where: { clerkId },
    select: { divisionId: true },
  });
  return memberships.map((m) => m.divisionId);
}

export async function getUserRoleInDivision(
  clerkId: string,
  divisionId: string,
) {
  const membership = await prisma.divisionMembership.findUnique({
    where: { clerkId_divisionId: { clerkId, divisionId } },
    select: { role: true },
  });
  return membership?.role ?? null;
}
