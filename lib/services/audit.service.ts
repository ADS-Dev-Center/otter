import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds } from "@/lib/auth";
import type { AuditAction } from "@/app/generated/prisma/enums";

export type AuditEntryDTO = {
  id: string;
  timestamp: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  resourceName: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorImageUrl: string;
  divisionId: string | null;
  divisionName: string | null;
  metadata: {
    oldValue?: string;
    newValue?: string;
    changeDescription?: string;
  } | null;
};

export async function getInitialAuditLogData(userId: string, perPage: number) {
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
      take: perPage,
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

  const client = await clerkClient();
  const actorCache = new Map<
    string,
    { name: string; email: string; imageUrl: string }
  >();

  async function resolveActor(actorId: string) {
    if (actorCache.has(actorId)) return actorCache.get(actorId)!;
    try {
      const user = await client.users.getUser(actorId);
      const info = {
        name:
          [user.firstName, user.lastName].filter(Boolean).join(" ") ||
          user.primaryEmailAddress?.emailAddress ||
          "Unknown User",
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
    entries.map(async (entry) => {
      const actor = await resolveActor(entry.actorId);
      const meta = entry.metadata as {
        oldValue?: string;
        newValue?: string;
        changeDescription?: string;
      } | null;
      return {
        id: entry.id,
        timestamp: entry.timestamp.toISOString(),
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        resourceName: entry.resourceName,
        actorId: entry.actorId,
        actorName: actor.name,
        actorEmail: actor.email,
        actorImageUrl: actor.imageUrl,
        divisionId: entry.divisionId,
        divisionName: entry.division?.name ?? null,
        metadata: meta,
      };
    }),
  );

  return {
    initialEntries,
    total,
    divisions,
  };
}
