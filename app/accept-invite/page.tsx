import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WarningCircle, Buildings, UserCirclePlus } from "@phosphor-icons/react/dist/ssr";
import { prisma } from "@/lib/prisma";
import { AcceptInviteButton } from "@/components/invite/AcceptInviteButton";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <ErrorCard message="Invalid invite link. Please contact your admin." />
    );
  }

  // Look up invitation to show info regardless of auth state
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { division: { select: { name: true } } },
  });

  if (!invitation) {
    return (
      <ErrorCard message="Invitation not found. It may have been revoked or never existed." />
    );
  }

  if (invitation.status !== "PENDING") {
    if (invitation.status === "ACCEPTED") {
      return (
        <ErrorCard message="This invitation has already been accepted." />
      );
    }
    return (
      <ErrorCard message="This invitation has been revoked." />
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <ErrorCard message="This invite link has expired. Ask your admin to send a new one." />
    );
  }

  const { userId } = await auth();

  // User is not authenticated — show invitation info and prompt to sign up/sign in
  if (!userId) {
    const redirectUrl = `/accept-invite?token=${encodeURIComponent(token)}`;
    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`;
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`;

    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--canvas-bg) p-4">
        <div className="glass-heavy w-full max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(77,142,255,0.12)]">
              <UserCirclePlus
                size={28}
                weight="duotone"
                color="var(--accent-primary)"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold text-(--text-primary)">
                You&apos;re invited
              </h1>
              <p className="text-sm text-(--text-muted)">
                You&apos;ve been invited to join <strong className="text-(--text-primary)">{invitation.division.name}</strong> as a{" "}
                <strong className="text-(--text-primary)">
                  {invitation.role === "DIVISION_ADMIN" ? "Admin" : "Member"}
                </strong>.
              </p>
            </div>

            <div className="w-full rounded-xl border border-(--glass-border-subtle) bg-(--glass-bg) p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(77,142,255,0.12)]">
                  <Buildings size={20} weight="duotone" color="var(--accent-primary)" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-sm font-semibold text-(--text-primary)">
                    {invitation.division.name}
                  </span>
                  <span className="text-xs text-(--text-muted)">
                    Role: {invitation.role === "DIVISION_ADMIN" ? "Admin" : "Member"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-(--text-subtle)">
              Sign up or sign in to accept this invitation.
            </p>

            <div className="flex w-full flex-col gap-2">
              <Link
                href={signUpUrl}
                className="flex h-10 w-full items-center justify-center rounded-lg bg-(--accent-primary) text-sm font-medium text-white hover:opacity-90"
              >
                Sign up to accept
              </Link>
              <Link
                href={signInUrl}
                className="flex h-10 w-full items-center justify-center rounded-lg border border-(--glass-border) bg-(--glass-bg) text-sm font-medium text-(--text-primary) hover:bg-(--glass-bg-hover)"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated — check if they need onboarding first
  const membershipCount = await prisma.divisionMembership.count({
    where: { clerkId: userId },
  });

  if (membershipCount === 0) {
    // User has no divisions yet — redirect to onboarding with a return URL
    const returnUrl = `/accept-invite?token=${encodeURIComponent(token)}`;
    redirect(`/onboarding?redirect_url=${encodeURIComponent(returnUrl)}`);
  }

  // User is authenticated and has completed onboarding — show accept UI
  // Check if already a member
  const existingMembership = await prisma.divisionMembership.findUnique({
    where: {
      clerkId_divisionId: {
        clerkId: userId,
        divisionId: invitation.divisionId,
      },
    },
  });

  if (existingMembership) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--canvas-bg) p-4">
      <div className="glass-heavy w-full max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(77,142,255,0.12)]">
            <Buildings
              size={28}
              weight="duotone"
              color="var(--accent-primary)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-(--text-primary)">
              Accept invitation
            </h1>
            <p className="text-sm text-(--text-muted)">
              You&apos;ve been invited to join <strong className="text-(--text-primary)">{invitation.division.name}</strong> as a{" "}
              <strong className="text-(--text-primary)">
                {invitation.role === "DIVISION_ADMIN" ? "Admin" : "Member"}
              </strong>.
            </p>
          </div>

          <div className="w-full rounded-xl border border-(--glass-border-subtle) bg-(--glass-bg) p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(77,142,255,0.12)]">
                <Buildings size={20} weight="duotone" color="var(--accent-primary)" />
              </div>
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-semibold text-(--text-primary)">
                  {invitation.division.name}
                </span>
                <span className="text-xs text-(--text-muted)">
                  Role: {invitation.role === "DIVISION_ADMIN" ? "Admin" : "Member"}
                </span>
              </div>
            </div>
          </div>

          <AcceptInviteButton token={token} />
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--canvas-bg) p-4">
      <div className="glass w-full max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[rgba(239,68,68,0.12)]">
            <WarningCircle
              size={28}
              weight="duotone"
              color="var(--accent-red, #ef4444)"
            />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold text-(--text-primary)">
              Invite unavailable
            </h1>
            <p className="text-sm text-(--text-muted)">{message}</p>
          </div>
          <p className="text-xs text-(--text-subtle)">
            If you need access, ask your division admin to send a new invite.
          </p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-(--accent-primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Go to Otter
          </Link>
        </div>
      </div>
    </div>
  );
}
