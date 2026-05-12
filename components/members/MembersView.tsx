"use client";

import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Check,
  CheckCircle,
  Copy,
  LinkSimple,
  ShieldCheck,
  Spinner,
  Trash,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DangerDialog } from "@/components/ui/danger-dialog";
import { cn } from "@/lib/utils";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DIVISION_CONTEXT_EVENT,
} from "@/lib/divisions";
import {
  changeMemberRoleAction,
  inviteMemberAction,
  listMembersByDivisionAction,
  listMyDivisionsAction,
  removeMemberAction,
  revokeInvitationAction,
} from "@/app/actions/members";

type ApiRole = "SUPER_ADMIN" | "DIVISION_OWNER" | "DIVISION_ADMIN" | "MEMBER";
type InviteRole = "DIVISION_ADMIN" | "MEMBER";

type Member = {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: ApiRole;
  createdAt: Date | string;
};

type PendingInvite = {
  id: string;
  email: string;
  role: ApiRole;
  expiresAt: Date | string;
  createdAt: Date | string;
  inviteUrl: string;
};

type RoleOption = { value: InviteRole; label: string; description: string };

const inviteRoleOptions: RoleOption[] = [
  {
    value: "DIVISION_ADMIN",
    label: "Admin",
    description: "Invite and manage projects",
  },
  { value: "MEMBER", label: "Member", description: "View assigned projects" },
];

function roleBadgeVariant(role: ApiRole) {
  if (role === "SUPER_ADMIN") return "default" as const;
  if (role === "DIVISION_OWNER") return "default" as const;
  if (role === "DIVISION_ADMIN") return "secondary" as const;
  return "outline" as const;
}

function roleLabel(role: ApiRole) {
  if (role === "SUPER_ADMIN") return "Super Admin";
  if (role === "DIVISION_OWNER") return "Owner";
  if (role === "DIVISION_ADMIN") return "Admin";
  return "Member";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getInviteLabel(email: string) {
  if (/^invite-\d+@(placeholder\.local|link)$/i.test(email)) {
    return "Invite link";
  }
  if (email === "invite-link" || email === "invite-link@otter.local") {
    return "Invite link";
  }
  return email;
}

const ACCENT_CLASSES = [
  "bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
  "bg-[rgba(45,212,191,0.12)] text-(--accent-teal)",
  "bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
  "bg-[rgba(139,92,246,0.12)] text-(--accent-purple)",
];

function RoleSelectorDialog({
  title,
  description,
  value,
  onSave,
  triggerLabel,
  ownerOnly,
}: {
  title: string;
  description: string;
  value: InviteRole;
  onSave: (role: InviteRole) => void;
  triggerLabel: string;
  ownerOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<InviteRole>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  function handleSave() {
    onSave(draft);
    setOpen(false);
  }

  const options = ownerOnly
    ? inviteRoleOptions
    : inviteRoleOptions.filter((o) => o.value !== "DIVISION_ADMIN");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-lg bg-(--glass-bg)"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <GlassDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className="rounded-lg bg-(--glass-bg)"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" className="rounded-lg" onClick={handleSave}>
              Save role
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <RadioGroup
            value={draft}
            onValueChange={(v) => setDraft(v as InviteRole)}
          >
            {options.map((opt) => {
              const inputId = `${title}-${opt.value}`
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-");
              return (
                <label
                  key={opt.value}
                  htmlFor={inputId}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    draft === opt.value
                      ? "border-(--accent-primary) bg-(--glass-bg-active)"
                      : "border-(--glass-border-subtle) bg-(--glass-bg) hover:bg-(--glass-bg-hover)",
                  )}
                >
                  <RadioGroupItem
                    id={inputId}
                    value={opt.value}
                    className="mt-1"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-(--text-primary)">
                      {opt.label}
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      {opt.description}
                    </span>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
      </GlassDialog>
    </>
  );
}

function InviteLinkModal({
  inviteUrl,
  onClose,
}: {
  inviteUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="glass-heavy rounded-2xl border-(--glass-border) text-(--text-primary) w-[calc(100%-2rem)] max-w-sm sm:max-w-md px-4 sm:px-6">
        <DialogHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(18,183,106,0.28)] bg-[rgba(18,183,106,0.10)]">
              <CheckCircle
                weight="duotone"
                size={18}
                color="var(--state-success)"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <DialogTitle className="text-base text-(--text-primary)">
                Invite link generated
              </DialogTitle>
              <DialogDescription className="text-xs text-(--text-muted)">
                Share this link with your teammate to invite them.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-xl border border-(--glass-border-subtle) bg-(--glass-bg) p-3 sm:flex-row sm:items-center sm:gap-2">
          <LinkSimple
            weight="duotone"
            size={14}
            color="var(--text-muted)"
            className="shrink-0"
          />
          <p className="min-w-0 flex-1 break-all font-mono text-xs text-(--text-primary) sm:text-sm">
            {inviteUrl}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "shrink-0 rounded-lg transition-colors w-full sm:w-auto",
              copied
                ? "border-[rgba(18,183,106,0.36)] bg-[rgba(18,183,106,0.10)] text-(--state-success) hover:bg-[rgba(18,183,106,0.14)]"
                : "bg-(--glass-bg)",
            )}
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check data-icon="inline-start" weight="bold" size={13} />
                Copied
              </>
            ) : (
              <>
                <Copy data-icon="inline-start" weight="duotone" size={13} />
                Copy link
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-(--text-subtle) order-2 sm:order-1">
            Expires in 7 days.
          </p>
          <Button
            type="button"
            className="rounded-lg order-1 sm:order-2 w-full sm:w-auto"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="shrink-0 h-6 px-2 text-xs"
      onClick={handleCopy}
    >
      {copied ? (
        <Check size={12} weight="bold" color="var(--state-success)" />
      ) : (
        <Copy size={12} weight="duotone" color="var(--text-muted)" />
      )}
    </Button>
  );
}

export function MembersView() {
  const { userId } = useAuth();
  const [divisionId, setDivisionId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inviteRole, setInviteRole] = useState<InviteRole>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, startInviting] = useTransition();
  const [inviteLink, setInviteLink] = useState<{
    url: string;
  } | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{
    id: string;
    name: string;
    isSelf: boolean;
  } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY);
    if (stored) setDivisionId(stored);

    function onDivisionChange(e: Event) {
      const detail = (e as CustomEvent<{ activeDivisionId: string }>).detail;
      if (detail?.activeDivisionId) setDivisionId(detail.activeDivisionId);
    }
    window.addEventListener(DIVISION_CONTEXT_EVENT, onDivisionChange);
    return () =>
      window.removeEventListener(DIVISION_CONTEXT_EVENT, onDivisionChange);
  }, []);

  useEffect(() => {
    if (!divisionId) return;
    const currentDivisionId = divisionId;
    let cancelled = false;

    async function loadMembers() {
      setLoading(true);
      setError(null);

      try {
        const result = await listMembersByDivisionAction({
          divisionId: currentDivisionId,
        });

        if (!result.ok) {
          if (result.error.code === "FORBIDDEN") {
            // Active division in localStorage might be stale after leaving/kicked.
            const divisionsResult = await listMyDivisionsAction();
            const fallbackDivisionId =
              divisionsResult.ok && divisionsResult.data.length > 0
                ? divisionsResult.data[0].id
                : undefined;

            if (
              fallbackDivisionId &&
              fallbackDivisionId !== currentDivisionId
            ) {
              if (cancelled) return;
              localStorage.setItem(
                ACTIVE_DIVISION_STORAGE_KEY,
                fallbackDivisionId,
              );
              window.dispatchEvent(
                new CustomEvent(DIVISION_CONTEXT_EVENT, {
                  detail: { activeDivisionId: fallbackDivisionId },
                }),
              );
              setDivisionId(fallbackDivisionId);
              return;
            }

            if (!fallbackDivisionId) {
              throw new Error("You are not a member of any division.");
            }
          }

          throw new Error(result.error.message || "Failed to load members");
        }

        if (cancelled) return;
        setMembers(result.data.members);
        setPendingInvites(result.data.pendingInvites);
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [divisionId]);

  function handleGenerateLink() {
    if (!divisionId) return;
    setInviteError(null);

    startInviting(async () => {
      const result = await inviteMemberAction({
        email: "",
        role: inviteRole,
        divisionId,
      });

      if (!result.ok) {
        setInviteError(
          result.error.message ?? "Failed to generate link. Please try again.",
        );
        return;
      }

      if (result.data?.status === "pending" && result.data.inviteUrl) {
        setInviteLink({ url: result.data.inviteUrl });
        const refreshed = await listMembersByDivisionAction({
          divisionId,
        });
        if (refreshed.ok) {
          setPendingInvites(refreshed.data.pendingInvites);
        }
      }
    });
  }

  async function handleChangeRole(membershipId: string, newRole: InviteRole) {
    const result = await changeMemberRoleAction({
      membershipId,
      role: newRole,
    });
    if (result.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m)),
      );
      toast.success("Role updated", { description: roleLabel(newRole) });
    } else {
      toast.error("Failed to update role", {
        description: result.error.message,
      });
    }
  }

  async function handleRemoveMember(membershipId: string) {
    setRemovingId(membershipId);
    const member = members.find((m) => m.id === membershipId);
    const isSelf = member?.clerkId === userId;
    try {
      const result = await removeMemberAction({ membershipId });
      if (result.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== membershipId));
        toast.success(isSelf ? "You left the division" : "Member removed", {
          description: isSelf ? undefined : member?.name,
        });
        if (isSelf) {
          window.location.href = "/dashboard";
          return;
        }
      } else {
        throw new Error(result.error.message || "Failed to remove member");
      }
    } finally {
      setRemovingId(null);
    }
  }

  function openRemoveConfirmation(member: Member) {
    setPendingRemoval({
      id: member.id,
      name: member.name,
      isSelf: member.clerkId === userId,
    });
  }

  async function handleRevokeInvite(inviteId: string) {
    setRevokingId(inviteId);
    const invite = pendingInvites.find((i) => i.id === inviteId);
    const result = await revokeInvitationAction({ invitationId: inviteId });
    if (result.ok) {
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite revoked", {
        description: getInviteLabel(invite?.email ?? "Invite link"),
      });
    } else {
      toast.error("Failed to revoke invite", {
        description: result.error.message,
      });
    }
    setRevokingId(null);
  }

  const currentMembership = members.find((member) => member.clerkId === userId);
  const canManageMembers =
    currentMembership?.role === "DIVISION_OWNER" ||
    currentMembership?.role === "DIVISION_ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <UsersThree
            weight="duotone"
            size={24}
            color="var(--accent-primary)"
          />
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Members
          </h1>
        </div>
        <p className="max-w-3xl text-sm text-(--text-muted)">
          Review the people in this division and keep access up to date.
        </p>
      </header>

      {/* Invite form */}
      {canManageMembers ? (
        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="text-(--text-primary)">
              Invite member
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Generate a share link and send it to your teammate to invite them
              to this division.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">Admin only</Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-(--text-muted)">
                    Role
                  </p>
                  <div className="flex items-center gap-2">
                    <RoleSelectorDialog
                      title="Select invite role"
                      description="Choose the starting access level for the invited teammate."
                      value={inviteRole}
                      onSave={setInviteRole}
                      triggerLabel="Select role"
                      ownerOnly
                    />
                    <Badge variant="outline" className="bg-(--glass-bg)">
                      {roleLabel(inviteRole)}
                    </Badge>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  className="rounded-lg"
                  disabled={inviting}
                  onClick={handleGenerateLink}
                >
                  {inviting ? (
                    <Spinner
                      data-icon="inline-start"
                      weight="bold"
                      className="animate-spin"
                    />
                  ) : (
                    <LinkSimple data-icon="inline-start" weight="duotone" />
                  )}
                  Generate invite link
                </Button>
              </div>
              {inviteError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                  <X size={12} weight="bold" />
                  {inviteError}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Active members */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-(--text-primary)">
            Member list
          </p>
          <p className="text-sm text-(--text-muted)">
            {canManageMembers
              ? "Active members with role controls."
              : "Active members in this division."}
          </p>
        </div>
        <Badge variant="outline">{members.length} active</Badge>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-(--text-muted)">
          <Spinner size={14} className="animate-spin" />
          Loading members…
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {members.map((member, index) => {
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length];
            const isOwner = member.role === "DIVISION_OWNER";
            const isSelf = member.clerkId === userId;

            return (
              <Card
                key={member.id}
                className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)"
              >
                <CardContent className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      {member.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="size-12 shrink-0 rounded-xl object-cover ring-1 ring-(--glass-border)"
                        />
                      ) : (
                        <div
                          className={cn(
                            "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ring-(--glass-border)",
                            accentClass,
                          )}
                        >
                          {getInitials(member.name)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold text-(--text-primary)">
                            {member.name}
                          </h2>
                          <Badge variant={roleBadgeVariant(member.role)}>
                            {roleLabel(member.role)}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-(--text-muted)">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:shrink-0">
                      {isOwner ? (
                        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                          <ShieldCheck
                            weight="duotone"
                            size={14}
                            color="var(--accent-amber)"
                          />
                          Division owner
                        </div>
                      ) : canManageMembers && !isSelf ? (
                        <>
                          <RoleSelectorDialog
                            title={`Change role for ${member.name}`}
                            description="Pick the access level for this member."
                            value={member.role as InviteRole}
                            onSave={(nextRole) =>
                              handleChangeRole(member.id, nextRole)
                            }
                            triggerLabel="Change role"
                            ownerOnly
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg bg-(--glass-bg) text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400"
                            onClick={() => openRemoveConfirmation(member)}
                            disabled={removingId === member.id}
                          >
                            {removingId === member.id ? (
                              <Spinner size={13} className="animate-spin" />
                            ) : (
                              <Trash weight="duotone" size={13} />
                            )}
                            Remove member
                          </Button>
                        </>
                      ) : isSelf ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg bg-(--glass-bg) text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400"
                          onClick={() => openRemoveConfirmation(member)}
                          disabled={removingId === member.id}
                        >
                          {removingId === member.id ? (
                            <Spinner size={13} className="animate-spin" />
                          ) : (
                            <Trash weight="duotone" size={13} />
                          )}
                          Leave division
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <Separator className="bg-(--glass-border-subtle)" />

                  <div className="flex items-center justify-between text-xs text-(--text-muted)">
                    <span>
                      Member since{" "}
                      {new Date(member.createdAt).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span className="font-medium text-(--text-primary)">
                      {roleLabel(member.role)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending invites */}
      {canManageMembers && pendingInvites.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-(--text-primary)">
                Active invite links
              </p>
              <p className="text-sm text-(--text-muted)">
                Share links that have not been used yet.
              </p>
            </div>
            <Badge variant="outline">{pendingInvites.length} active</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <Card
                key={inv.id}
                className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)"
              >
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={roleBadgeVariant(inv.role)}
                          className="text-xs"
                        >
                          {roleLabel(inv.role)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs bg-[rgba(245,166,35,0.08)] text-(--accent-amber) border-[rgba(245,166,35,0.24)]"
                        >
                          Awaiting claim
                        </Badge>
                        <span className="text-xs text-(--text-muted)">
                          Expires {new Date(inv.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-lg bg-(--glass-bg) text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400"
                      onClick={() => handleRevokeInvite(inv.id)}
                      disabled={revokingId === inv.id}
                    >
                      {revokingId === inv.id ? (
                        <Spinner size={13} className="animate-spin" />
                      ) : (
                        <X size={13} weight="bold" />
                      )}
                      Revoke
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2">
                    <LinkSimple
                      size={12}
                      weight="duotone"
                      color="var(--text-muted)"
                      className="shrink-0"
                    />
                    <p className="min-w-0 flex-1 break-all font-mono text-xs text-(--text-muted)">
                      {inv.inviteUrl}
                    </p>
                    <CopyLinkButton url={inv.inviteUrl} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {inviteLink && (
        <InviteLinkModal
          inviteUrl={inviteLink.url}
          onClose={() => {
            setInviteLink(null);
          }}
        />
      )}

      <DangerDialog
        open={Boolean(pendingRemoval)}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
        title={pendingRemoval?.isSelf ? "Leave division?" : "Remove member?"}
        description={
          pendingRemoval?.isSelf
            ? "You will lose access to this division immediately."
            : `This will remove ${pendingRemoval?.name ?? "this member"} from the division.`
        }
        actionLabel={
          pendingRemoval?.isSelf ? "Leave division" : "Remove member"
        }
        loadingLabel={pendingRemoval?.isSelf ? "Leaving..." : "Removing..."}
        onAction={async () => {
          if (!pendingRemoval) return;
          await handleRemoveMember(pendingRemoval.id);
          setPendingRemoval(null);
        }}
      />
    </div>
  );
}
