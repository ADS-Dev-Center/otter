import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds } from "@/lib/auth";
import { auditQuerySchema } from "@/lib/validations/audit";
import type { AuditAction } from "@/app/generated/prisma/enums";

type ActorInfo = { name: string; email: string; imageUrl: string };

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

const DATE_RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = auditQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid query params" } },
      { status: 400 },
    );
  }

  const { divisionId, action, resourceType, dateRange, q, page, perPage } =
    parsed.data;

  const userDivisionIds = await getUserDivisionIds(userId);

  // Scope division filter to user's memberships (SUPER_ADMIN could pass divisionId=all)
  let divisionFilter: string[];
  if (divisionId && divisionId !== "all") {
    if (!userDivisionIds.includes(divisionId)) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Not a member of this division" } },
        { status: 403 },
      );
    }
    divisionFilter = [divisionId];
  } else {
    divisionFilter = userDivisionIds;
  }

  // Date range filter
  const since =
    dateRange !== "all" && DATE_RANGE_MS[dateRange]
      ? new Date(Date.now() - DATE_RANGE_MS[dateRange])
      : undefined;

  const where = {
    divisionId: { in: divisionFilter },
    ...(action && action !== "ALL" && { action: action as AuditAction }),
    ...(resourceType && resourceType !== "ALL" && { resourceType }),
    ...(since && { timestamp: { gte: since } }),
    ...(q && {
      OR: [
        { actorId: { contains: q, mode: "insensitive" as const } },
        { resourceName: { contains: q, mode: "insensitive" as const } },
        { resourceType: { contains: q, mode: "insensitive" as const } },
      ],
    }),
  };

  const [entries, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { division: { select: { name: true } } },
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.auditLog.count({ where }),
  ]);

  // Resolve Clerk actor info with per-request cache
  const client = await clerkClient();
  const actorCache = new Map<string, ActorInfo>();

  async function resolveActor(actorId: string): Promise<ActorInfo> {
    if (actorCache.has(actorId)) return actorCache.get(actorId)!;

    // DB first — webhook keeps User table in sync
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: actorId },
      select: { name: true, email: true, imageUrl: true },
    });
    if (dbUser && dbUser.name && dbUser.name !== "Unknown") {
      const info: ActorInfo = {
        name: dbUser.name,
        email: dbUser.email,
        imageUrl: dbUser.imageUrl ?? "",
      };
      actorCache.set(actorId, info);
      return info;
    }

    // Fall back to Clerk API
    try {
      const user = await client.users.getUser(actorId);
      const email = user.primaryEmailAddress?.emailAddress ?? "";
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        email ||
        actorId;
      const info: ActorInfo = { name, email, imageUrl: user.imageUrl };
      actorCache.set(actorId, info);
      return info;
    } catch {
      const fallback: ActorInfo = {
        name: dbUser?.email || "Unknown User",
        email: dbUser?.email ?? "",
        imageUrl: "",
      };
      actorCache.set(actorId, fallback);
      return fallback;
    }
  }

  const data: AuditEntryDTO[] = await Promise.all(
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

  return NextResponse.json({
    data: {
      entries: data,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / perPage)),
    },
  });
}
