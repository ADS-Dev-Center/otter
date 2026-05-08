import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDivisionSchema } from "@/lib/validations/division";
import { getDivisionPalette } from "@/lib/divisions";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

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

  const divisions = await Promise.all(
    memberships.map(async (m, index) => {
      const palette = getDivisionPalette(index);
      const memberCount = m.division._count.memberships;
      const members = await Promise.all(
        m.division.memberships.slice(0, 4).map(async (membership) => {
          try {
            const user = await client.users.getUser(membership.clerkId);
            const initials =
              `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`
                .toUpperCase()
                .trim();

            return {
              initials: initials || "??",
              gradientFrom: palette.gradientFrom,
              gradientTo: palette.gradientTo,
            };
          } catch {
            return {
              initials: "??",
              gradientFrom: palette.gradientFrom,
              gradientTo: palette.gradientTo,
            };
          }
        }),
      );

      return {
        id: m.division.id,
        name: m.division.name,
        role: m.role,
        memberCount,
        iconBgClass: palette.iconBgClass,
        iconColor: palette.iconColor,
        accentBarClass: palette.accentBarClass,
        accentColor: palette.accentColor,
        members,
      };
    }),
  );

  return NextResponse.json({ data: divisions });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const body: unknown = await req.json();
  const result = createDivisionSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          fieldErrors: result.error.flatten().fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const division = await prisma.division.create({
    data: {
      name: result.data.name,
      memberships: {
        create: {
          clerkId: userId,
          role: "DIVISION_OWNER",
        },
      },
    },
  });

  return NextResponse.json({ data: division }, { status: 201 });
}
