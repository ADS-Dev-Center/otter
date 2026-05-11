import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDivisionPalette } from "@/lib/divisions";
import type { DashboardProject } from "@/components/dashboard/DashboardProjectCards";
import type { ActivityEntry } from "@/components/dashboard/RecentActivity";
import type { DashboardMember } from "@/components/dashboard/MembersList";

const BADGE_CLASS: Record<string, string> = {
  primary:
    "border-[rgba(77,142,255,0.2)] bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
  teal: "border-[rgba(45,212,191,0.2)] bg-[rgba(45,212,191,0.12)] text-(--accent-teal)",
  amber:
    "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
  purple:
    "border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.12)] text-(--accent-purple)",
};

export async function getDashboardData(userId: string) {
  const memberships = await prisma.divisionMembership.findMany({
    where: { clerkId: userId },
    include: {
      division: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const userDivisionIds = memberships.map(
    (membership) => membership.divisionId,
  );
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    projectCount,
    credentialCount,
    auditCount,
    recentLogs,
    allProjects,
    allMemberships,
  ] = await Promise.all([
    prisma.project.count({
      where: { divisionId: { in: userDivisionIds } },
    }),
    prisma.credential.count({
      where: { project: { divisionId: { in: userDivisionIds } } },
    }),
    prisma.auditLog.count({
      where: {
        divisionId: { in: userDivisionIds },
        timestamp: { gte: sevenDaysAgo },
      },
    }),
    prisma.auditLog.findMany({
      where: { divisionId: { in: userDivisionIds } },
      include: { division: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: 7,
    }),
    prisma.project.findMany({
      where: { divisionId: { in: userDivisionIds } },
      include: {
        _count: { select: { credentials: true } },
        division: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.divisionMembership.findMany({
      where: { divisionId: { in: userDivisionIds } },
      include: { division: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const divisionIndexMap = new Map(
    memberships.map((membership, index) => [membership.divisionId, index]),
  );

  const actorIds = [...new Set(recentLogs.map((log) => log.actorId))];
  const memberClerkIds = [
    ...new Set(allMemberships.map((membership) => membership.clerkId)),
  ];
  const allClerkIds = [...new Set([...actorIds, ...memberClerkIds])];

  const dbUsers =
    allClerkIds.length > 0
      ? await prisma.user.findMany({
          where: { clerkId: { in: allClerkIds } },
          select: { clerkId: true, name: true, email: true, imageUrl: true },
        })
      : [];
  const userMap = new Map(dbUsers.map((user) => [user.clerkId, user]));

  const projectCards: DashboardProject[] = allProjects.map((project) => {
    const divisionIndex = divisionIndexMap.get(project.divisionId) ?? 0;
    const palette = getDivisionPalette(divisionIndex);
    return {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      credentialCount: project._count.credentials,
      divisionName: project.division.name,
      iconBgClass: palette.iconBgClass,
      iconColor: palette.iconColor,
      badgeClass: BADGE_CLASS[palette.accentColor] ?? BADGE_CLASS.primary,
      updatedAt: project.updatedAt,
    };
  });

  const activityData: ActivityEntry[] = recentLogs.map((log) => {
    const actor = userMap.get(log.actorId);
    return {
      id: log.id,
      action: log.action,
      resourceName: log.resourceName,
      divisionName: log.division?.name ?? null,
      actorName: actor?.name ?? log.actorId,
      actorImageUrl: actor?.imageUrl ?? null,
      timestamp: log.timestamp,
    };
  });

  const memberData: DashboardMember[] = allMemberships.map((membership) => {
    const dbUser = userMap.get(membership.clerkId);
    return {
      id: membership.id,
      clerkId: membership.clerkId,
      name: dbUser?.name ?? membership.clerkId,
      email: dbUser?.email ?? "",
      imageUrl: dbUser?.imageUrl ?? null,
      role: membership.role,
      divisionName: membership.division.name,
    };
  });

  return {
    memberships,
    projectCount,
    credentialCount,
    auditCount,
    projectCards,
    activityData,
    memberData,
  };
}
