import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { acceptInvitation } from "@/lib/services/member.service";
import { isDomainError } from "@/lib/errors";

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

  const { userId } = await auth();

  if (!userId) {
    const redirectUrl = `/accept-invite?token=${encodeURIComponent(token)}`;
    redirect(`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`);
  }

  try {
    await acceptInvitation(userId, token);
    redirect("/");
  } catch (error) {
    if (!isDomainError(error)) {
      console.error("[accept-invite]", error);
      return (
        <ErrorCard message="Something went wrong. Please try again later." />
      );
    }

    if (error.code === "NOT_FOUND") {
      return (
        <ErrorCard message="Invitation not found. It may have been revoked or never existed." />
      );
    }

    if (error.code === "EXPIRED") {
      return (
        <ErrorCard message="This invite link has expired. Ask your admin to send a new one." />
      );
    }

    if (error.code === "INVALID") {
      return <ErrorCard message={error.message} />;
    }

    return <ErrorCard message={error.message} />;
  }
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
