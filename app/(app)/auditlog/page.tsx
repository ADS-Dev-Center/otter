import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds } from "@/lib/auth";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditLogSkeleton } from "@/components/audit/AuditLogSkeleton";
import type { AuditEntryDTO } from "@/app/api/audit/route";
import { clerkClient } from "@clerk/nextjs/server";

const INITIAL_PER_PAGE = 15;

async function AuditLogLoader() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const divisionIds = await getUserDivisionIds(userId);

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [entries, total, divisions] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        divisionId: { in: divisionIds },
        timestamp: { gte: since },
      },
      include: { division: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      take: INITIAL_PER_PAGE,
    }),
    prisma.auditLog.count({
      where: {
        divisionId: { in: divisionIds },
        timestamp: { gte: since },
      },
    }),
    prisma.division.findMany({
      where: { id: { in: divisionIds } },
      select: { id: true, name: true },
    }),
  ]);

  // Resolve Clerk actor info with cache
  const client = await clerkClient();
  const actorCache = new Map<string, { name: string; email: string; imageUrl: string }>();

  async function resolveActor(actorId: string) {
    if (actorCache.has(actorId)) return actorCache.get(actorId)!;
    try {
      const user = await client.users.getUser(actorId);
      const info = {
        name: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
      };
      actorCache.set(actorId, info);
      return info;
    } catch {
      const fallback = { name: "Unknown", email: "", imageUrl: "" };
      actorCache.set(actorId, fallback);
      return fallback;
    }
  }

  const initialEntries: AuditEntryDTO[] = await Promise.all(
    entries.map(async (e) => {
      const actor = await resolveActor(e.actorId);
      const meta = e.metadata as {
        oldValue?: string;
        newValue?: string;
        changeDescription?: string;
      } | null;
      return {
        id: e.id,
        timestamp: e.timestamp.toISOString(),
        action: e.action,
        resourceType: e.resourceType,
        resourceId: e.resourceId,
        resourceName: e.resourceName,
        actorId: e.actorId,
        actorName: actor.name,
        actorEmail: actor.email,
        actorImageUrl: actor.imageUrl,
        divisionId: e.divisionId,
        divisionName: e.division?.name ?? null,
        metadata: meta,
      };
    }),
  );

  return (
    <AuditLogTable
      initialEntries={initialEntries}
      initialTotal={total}
      initialPages={Math.max(1, Math.ceil(total / INITIAL_PER_PAGE))}
      divisions={divisions}
    />
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<AuditLogSkeleton />}>
      <AuditLogLoader />
    </Suspense>
  );
}
