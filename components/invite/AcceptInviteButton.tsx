"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { acceptInvitationAction } from "@/app/actions/members";

export function AcceptInviteButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setLoading(true);
    setError(null);

    const result = await acceptInvitationAction({ token });

    if (!result.ok) {
      setError(result.error.message ?? "Failed to accept invitation.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <Button
        type="button"
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--accent-primary) font-medium text-white hover:opacity-90"
        onClick={handleAccept}
        disabled={loading}
      >
        {loading ? (
          <Spinner weight="bold" size={16} className="animate-spin" />
        ) : (
          <CheckCircle weight="duotone" size={16} />
        )}
        {loading ? "Joining…" : "Accept & join division"}
      </Button>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
