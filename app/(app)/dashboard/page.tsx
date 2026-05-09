import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDivisionPalette } from "@/lib/divisions";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardProjectCards } from "@/components/dashboard/DashboardProjectCards";
import type { DashboardProject } from "@/components/dashboard/DashboardProjectCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import type { ActivityEntry } from "@/components/dashboard/RecentActivity";
import { MembersList } from "@/components/dashboard/MembersList";
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

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, memberships] = await Promise.all([
    currentUser(),
    prisma.divisionMembership.findMany({
      where: { clerkId: userId },
      include: {
        division: { select: { name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const userDivisionIds = memberships.map((m) => m.divisionId);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [projectCount, credentialCount, auditCount, recentLogs, allProjects, allMemberships] =
    await Promise.all([
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

  // Division index map for palette lookups
  const divisionIndexMap = new Map(memberships.map((m, idx) => [m.divisionId, idx]));

  // Resolve users from DB for activity actors + members
  const actorIds = [...new Set(recentLogs.map((l) => l.actorId))];
  const memberClerkIds = [...new Set(allMemberships.map((m) => m.clerkId))];
  const allClerkIds = [...new Set([...actorIds, ...memberClerkIds])];

  const dbUsers =
    allClerkIds.length > 0
      ? await prisma.user.findMany({
          where: { clerkId: { in: allClerkIds } },
          select: { clerkId: true, name: true, email: true, imageUrl: true },
        })
      : [];
  const userMap = new Map(dbUsers.map((u) => [u.clerkId, u]));

  // Build typed props
  const projectCards: DashboardProject[] = allProjects.map((p) => {
    const divIdx = divisionIndexMap.get(p.divisionId) ?? 0;
    const palette = getDivisionPalette(divIdx);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      credentialCount: p._count.credentials,
      divisionName: p.division.name,
      iconBgClass: palette.iconBgClass,
      iconColor: palette.iconColor,
      badgeClass: BADGE_CLASS[palette.accentColor] ?? BADGE_CLASS.primary,
      updatedAt: p.updatedAt,
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

  const memberData: DashboardMember[] = allMemberships.map((m) => {
    const dbUser = userMap.get(m.clerkId);
    return {
      id: m.id,
      clerkId: m.clerkId,
      name: dbUser?.name ?? m.clerkId,
      email: dbUser?.email ?? "",
      imageUrl: dbUser?.imageUrl ?? null,
      role: m.role,
      divisionName: m.division.name,
    };
  });

  const firstName = user?.firstName ?? "there";
  const divisionNames = memberships.map((m) => m.division.name);

  return (
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {timeGreeting()}, {firstName} 👋
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Here&apos;s what&apos;s happening across your divisions today.
      </p>

      <DashboardStats
        divisionCount={memberships.length}
        projectCount={projectCount}
        credentialCount={credentialCount}
        auditCount={auditCount}
        divisionNames={divisionNames}
      />

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Projects
        </h2>
      </div>

      <DashboardProjectCards projects={projectCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <RecentActivity entries={activityData} />
        <MembersList members={memberData} />
      </div>
    </div>
  );
}
