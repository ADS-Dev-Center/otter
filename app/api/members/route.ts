import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserRoleInDivision } from "@/lib/auth";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(req.url);
  const divisionId = searchParams.get("divisionId");
  if (!divisionId) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "divisionId is required" } },
      { status: 400 },
    );
  }

  const callerRole = await getUserRoleInDivision(userId, divisionId);
  if (!callerRole) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Not a member of this division" } },
      { status: 403 },
    );
  }

  const [memberships, invitations] = await Promise.all([
    prisma.divisionMembership.findMany({
      where: { divisionId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: { divisionId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const client = await clerkClient();

  const members = await Promise.all(
    memberships.map(async (m) => {
      let name = "Unknown";
      let email = "";
      let imageUrl: string | null = null;

      // prefer synced User row first, fall back to Clerk API
      const dbUser = await prisma.user.findUnique({
        where: { clerkId: m.clerkId },
        select: { name: true, email: true, imageUrl: true },
      });

      if (dbUser) {
        name = dbUser.name;
        email = dbUser.email;
        imageUrl = dbUser.imageUrl ?? null;
      } else {
        try {
          const clerkUser = await client.users.getUser(m.clerkId);
          name =
            `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
            clerkUser.emailAddresses[0]?.emailAddress ||
            "Unknown";
          email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
          imageUrl = clerkUser.imageUrl ?? null;
        } catch {
          // non-fatal
        }
      }

      return {
        id: m.id,
        clerkId: m.clerkId,
        name,
        email,
        imageUrl,
        role: m.role,
        createdAt: m.createdAt,
      };
    }),
  );

  const pendingInvites = invitations.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expiresAt: inv.expiresAt,
    createdAt: inv.createdAt,
  }));

  return NextResponse.json({ data: { members, pendingInvites } });
}
