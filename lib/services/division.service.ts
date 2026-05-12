import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/backend";
import { prisma } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/audit";
import { getDivisionPalette } from "@/lib/divisions";
import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from "@/lib/errors";
import type { CreateDivisionInput } from "@/lib/validations/division";

async function requireOwner(userId: string, divisionId: string) {
  const membership = await prisma.divisionMembership.findUnique({
    where: { clerkId_divisionId: { clerkId: userId, divisionId } },
  });

  if (!membership || membership.role !== "DIVISION_OWNER") {
    throw new ForbiddenError(
      "Only the division owner can modify this division",
    );
  }
}

export async function listDivisionsForUser(userId: string) {
  const memberships = await prisma.divisionMembership.findMany({
    where: { clerkId: userId },
    include: {
      division: {
        include: {
          _count: { select: { memberships: true } },
          memberships: { take: 4, orderBy: { createdAt: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const client = await clerkClient();

  return Promise.all(
    memberships.map(async (membership, index) => {
      const palette = getDivisionPalette(index);
      const memberCount = membership.division._count.memberships;

      const memberSlice = membership.division.memberships.slice(0, 4);
      const userIds = memberSlice.map((m) => m.clerkId);

      const users: Map<string, User> = new Map();
      if (userIds.length > 0) {
        try {
          const userList = await client.users.getUserList({ userId: userIds });
          userList.data.forEach((user) => {
            users.set(user.id, user);
          });
        } catch {
          // If batch fetch fails, users map stays empty and we use fallbacks
        }
      }

      const members = memberSlice.map((member) => {
        const user = users.get(member.clerkId);
        if (user) {
          const initials =
            `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
              .toUpperCase()
              .trim();
          return {
            initials: initials || "??",
            imageUrl: user.imageUrl ?? null,
            gradientFrom: palette.gradientFrom,
            gradientTo: palette.gradientTo,
          };
        }
        return {
          initials: "??",
          imageUrl: null,
          gradientFrom: palette.gradientFrom,
          gradientTo: palette.gradientTo,
        };
      });

      return {
        id: membership.division.id,
        name: membership.division.name,
        role: membership.role,
        memberCount,
        iconBgClass: palette.iconBgClass,
        iconColor: palette.iconColor,
        accentBarClass: palette.accentBarClass,
        accentColor: palette.accentColor,
        members,
      };
    }),
  );
}

export async function getDivisionMembershipCount(userId: string) {
  return prisma.divisionMembership.count({ where: { clerkId: userId } });
}

export async function createDivision(
  userId: string,
  input: CreateDivisionInput,
) {
  const division = await prisma.division.create({
    data: {
      name: input.name,
      memberships: {
        create: {
          clerkId: userId,
          role: "DIVISION_OWNER",
        },
      },
    },
  });

  try {
    await writeAuditLog({
      actorId: userId,
      action: "DIVISION_CREATE",
      resourceType: "DIVISION",
      resourceId: division.id,
      resourceName: division.name,
      divisionId: division.id,
    });
  } catch (error) {
    // Preserve existing behavior: creation succeeds even if audit logging fails.
    console.error("[createDivision] audit log failed (non-fatal):", error);
  }

  return division;
}

export async function renameDivision(
  userId: string,
  divisionId: string,
  name: string,
) {
  await requireOwner(userId, divisionId);

  const existing = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { name: true },
  });
  if (!existing) {
    throw new NotFoundError("Division not found");
  }

  const division = await prisma.division.update({
    where: { id: divisionId },
    data: { name },
  });

  await writeAuditLog({
    actorId: userId,
    action: "DIVISION_RENAME",
    resourceType: "DIVISION",
    resourceId: divisionId,
    resourceName: division.name,
    divisionId,
    metadata: { oldValue: existing.name, newValue: division.name },
  });

  return division;
}

export async function deleteDivision(userId: string, divisionId: string) {
  await requireOwner(userId, divisionId);

  const totalMemberships = await prisma.divisionMembership.count({
    where: { clerkId: userId },
  });
  if (totalMemberships <= 1) {
    throw new UnprocessableEntityError(
      "Cannot delete your only division",
      "LAST_DIVISION",
    );
  }

  const division = await prisma.division.findUnique({
    where: { id: divisionId },
    select: { name: true },
  });
  if (!division) {
    throw new NotFoundError("Division not found");
  }

  await writeAuditLog({
    actorId: userId,
    action: "DIVISION_DELETE",
    resourceType: "DIVISION",
    resourceId: divisionId,
    resourceName: division.name,
    divisionId,
  });

  await prisma.division.delete({ where: { id: divisionId } });
}
