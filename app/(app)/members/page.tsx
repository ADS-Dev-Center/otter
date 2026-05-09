"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Check,
  CheckCircle,
  Copy,
  EnvelopeSimple,
  LinkSimple,
  Plus,
  ShieldCheck,
  Spinner,
  Trash,
  UsersThree,
  Warning,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { ACTIVE_DIVISION_STORAGE_KEY, DIVISION_CONTEXT_EVENT } from "@/lib/divisions";

type ApiRole = "DIVISION_OWNER" | "DIVISION_ADMIN" | "MEMBER";
type InviteRole = "DIVISION_ADMIN" | "MEMBER";

type Member = {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  imageUrl: string | null;
  role: ApiRole;
  createdAt: string;
};

type PendingInvite = {
  id: string;
  email: string;
  role: ApiRole;
  expiresAt: string;
  createdAt: string;
};

type RoleOption = { value: InviteRole; label: string; description: string };

const inviteRoleOptions: RoleOption[] = [
  { value: "DIVISION_ADMIN", label: "Admin", description: "Invite and manage projects" },
  { value: "MEMBER", label: "Member", description: "View assigned projects" },
];

function roleBadgeVariant(role: ApiRole) {
  if (role === "DIVISION_OWNER") return "default" as const;
  if (role === "DIVISION_ADMIN") return "secondary" as const;
  return "outline" as const;
}

function roleLabel(role: ApiRole) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-lg bg-(--glass-bg)"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <DialogContent className="glass-heavy rounded-2xl border-(--glass-border) text-(--text-primary) sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-(--text-primary)">{title}</DialogTitle>
          <DialogDescription className="text-(--text-muted)">{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <RadioGroup value={draft} onValueChange={(v) => setDraft(v as InviteRole)}>
            {options.map((opt) => {
              const inputId = `${title}-${opt.value}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
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
                  <RadioGroupItem id={inputId} value={opt.value} className="mt-1" />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-(--text-primary)">{opt.label}</span>
                    <span className="text-xs text-(--text-muted)">{opt.description}</span>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>
        <div className="flex items-center justify-end gap-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InviteLinkModal({
  inviteUrl,
  emailFailed,
  onClose,
}: {
  inviteUrl: string;
  emailFailed: boolean;
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
      <DialogContent className="glass-heavy rounded-2xl border-(--glass-border) text-(--text-primary) sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl border",
                emailFailed
                  ? "border-[rgba(245,166,35,0.28)] bg-[rgba(245,166,35,0.10)]"
                  : "border-[rgba(18,183,106,0.28)] bg-[rgba(18,183,106,0.10)]",
              )}
            >
              {emailFailed ? (
                <Warning weight="duotone" size={18} color="var(--accent-amber)" />
              ) : (
                <CheckCircle weight="duotone" size={18} color="var(--state-success)" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-base text-(--text-primary)">
                {emailFailed ? "Email delivery failed" : "Invite sent"}
              </DialogTitle>
              <DialogDescription className="text-xs text-(--text-muted)">
                {emailFailed
                  ? "Share this link directly with the invitee."
                  : "An email was sent. You can also share this link."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-xl border border-(--glass-border-subtle) bg-(--glass-bg) p-3">
          <LinkSimple
            weight="duotone"
            size={14}
            color="var(--text-muted)"
            className="shrink-0"
          />
          <p className="min-w-0 flex-1 truncate font-mono text-sm text-(--text-primary)">
            {inviteUrl}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "shrink-0 rounded-lg transition-colors",
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

        <div className="flex items-center justify-between">
          <p className="text-xs text-(--text-subtle)">Expires in 7 days.</p>
          <Button type="button" className="rounded-lg" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MembersPage() {
  const [divisionId, setDivisionId] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviting, startInviting] = useTransition();
  const [inviteLink, setInviteLink] = useState<{
    url: string;
    emailFailed: boolean;
  } | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY);
    if (stored) setDivisionId(stored);

    function onDivisionChange(e: Event) {
      const detail = (e as CustomEvent<{ activeDivisionId: string }>).detail;
      if (detail?.activeDivisionId) setDivisionId(detail.activeDivisionId);
    }
    window.addEventListener(DIVISION_CONTEXT_EVENT, onDivisionChange);
    return () => window.removeEventListener(DIVISION_CONTEXT_EVENT, onDivisionChange);
  }, []);

  useEffect(() => {
    if (!divisionId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/members?divisionId=${divisionId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load members");
        const json = (await res.json()) as {
          data: { members: Member[]; pendingInvites: PendingInvite[] };
        };
        setMembers(json.data.members);
        setPendingInvites(json.data.pendingInvites);
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [divisionId]);

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = inviteEmail.trim();
    if (!email || !divisionId) return;
    setInviteError(null);

    startInviting(async () => {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole, divisionId }),
      });

      const json = (await res.json()) as {
        data?: { status: string; message?: string; inviteUrl?: string; emailFailed?: boolean };
        error?: { code: string; message: string };
      };

      if (!res.ok) {
        if (res.status === 409) {
          setInviteError("This person is already a member of the division.");
        } else {
          setInviteError(json.error?.message ?? "Invite failed. Please try again.");
        }
        return;
      }

      setInviteEmail("");
      setInviteRole("MEMBER");

      if (json.data?.status === "added") {
        toast.success("Member added", { description: email });
        const refreshed = await fetch(`/api/members?divisionId=${divisionId}`).then((r) =>
          r.json(),
        ) as { data: { members: Member[]; pendingInvites: PendingInvite[] } };
        setMembers(refreshed.data.members);
        setPendingInvites(refreshed.data.pendingInvites);
      } else if (json.data?.status === "pending" && json.data.inviteUrl) {
        toast.success("Invite sent", { description: email });
        setInviteLink({
          url: json.data.inviteUrl,
          emailFailed: json.data.emailFailed ?? false,
        });
        const refreshed = await fetch(`/api/members?divisionId=${divisionId}`).then((r) =>
          r.json(),
        ) as { data: { members: Member[]; pendingInvites: PendingInvite[] } };
        setPendingInvites(refreshed.data.pendingInvites);
      }
    });
  }

  async function handleChangeRole(membershipId: string, newRole: InviteRole) {
    const res = await fetch(`/api/members/${membershipId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setMembers((prev) =>
        prev.map((m) => (m.id === membershipId ? { ...m, role: newRole } : m)),
      );
      toast.success("Role updated", { description: roleLabel(newRole) });
    } else {
      const json = (await res.json().catch(() => null)) as { error?: { message: string } } | null;
      toast.error("Failed to update role", { description: json?.error?.message });
    }
  }

  async function handleRemoveMember(membershipId: string) {
    setRemovingId(membershipId);
    const member = members.find((m) => m.id === membershipId);
    const res = await fetch(`/api/members/${membershipId}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== membershipId));
      toast.success("Member removed", { description: member?.name });
    } else {
      const json = (await res.json().catch(() => null)) as { error?: { message: string } } | null;
      toast.error("Failed to remove member", { description: json?.error?.message });
    }
    setRemovingId(null);
  }

  async function handleRevokeInvite(inviteId: string) {
    setRevokingId(inviteId);
    const invite = pendingInvites.find((i) => i.id === inviteId);
    const res = await fetch(`/api/members/invitations/${inviteId}`, { method: "DELETE" });
    if (res.ok) {
      setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
      toast.success("Invite revoked", { description: invite?.email });
    } else {
      const json = (await res.json().catch(() => null)) as { error?: { message: string } } | null;
      toast.error("Failed to revoke invite", { description: json?.error?.message });
    }
    setRevokingId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <UsersThree weight="duotone" size={24} color="var(--accent-primary)" />
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">Members</h1>
        </div>
        <p className="max-w-3xl text-sm text-(--text-muted)">
          Review the people in this division, adjust access for owners and admins, and queue email
          invites for new teammates without leaving the current workspace.
        </p>
      </header>

      {/* Invite form */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="text-(--text-primary)">Invite member</CardTitle>
          <CardDescription className="text-(--text-muted)">
            Admins can invite a new teammate by email and set the starting role.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">Admin only</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleInviteSubmit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.6fr_1fr_auto] md:items-end">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="invite-email"
                  className="text-xs font-medium text-(--text-muted)"
                >
                  Email address
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    weight="duotone"
                    size={14}
                    color="var(--text-muted)"
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="glass rounded-lg border-(--glass-border) bg-transparent pl-9 text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-(--text-muted)">Role</p>
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

              <Button type="submit" size="lg" className="rounded-lg" disabled={inviting}>
                {inviting ? (
                  <Spinner data-icon="inline-start" weight="bold" className="animate-spin" />
                ) : (
                  <Plus data-icon="inline-start" weight="duotone" />
                )}
                Send invite
              </Button>
            </div>
            {inviteError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400">
                <X size={12} weight="bold" />
                {inviteError}
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Active members */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-(--text-primary)">Member list</p>
          <p className="text-sm text-(--text-muted)">
            Active members with role controls.
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

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-4">
          {members.map((member, index) => {
            const accentClass = ACCENT_CLASSES[index % ACCENT_CLASSES.length];
            const isOwner = member.role === "DIVISION_OWNER";

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
                        <p className="mt-1 text-sm text-(--text-muted)">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:shrink-0">
                      {isOwner ? (
                        <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                          <ShieldCheck weight="duotone" size={14} color="var(--accent-amber)" />
                          Division owner
                        </div>
                      ) : (
                        <>
                          <RoleSelectorDialog
                            title={`Change role for ${member.name}`}
                            description="Pick the access level for this member."
                            value={member.role as InviteRole}
                            onSave={(nextRole) => handleChangeRole(member.id, nextRole)}
                            triggerLabel="Change role"
                            ownerOnly
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-lg bg-(--glass-bg) text-red-400 hover:bg-[rgba(239,68,68,0.08)] hover:text-red-400"
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={removingId === member.id}
                          >
                            {removingId === member.id ? (
                              <Spinner size={13} className="animate-spin" />
                            ) : (
                              <Trash weight="duotone" size={13} />
                            )}
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-(--glass-border-subtle)" />

                  <div className="flex items-center justify-between text-xs text-(--text-muted)">
                    <span>
                      Member since{" "}
                      {new Date(member.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })}
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
      {pendingInvites.length > 0 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-(--text-primary)">Pending invites</p>
              <p className="text-sm text-(--text-muted)">
                Invites waiting to be accepted.
              </p>
            </div>
            <Badge variant="outline">{pendingInvites.length} pending</Badge>
          </div>
          <div className="flex flex-col gap-3">
            {pendingInvites.map((inv) => (
              <Card
                key={inv.id}
                className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)"
              >
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="truncate text-sm font-medium text-(--text-primary)">{inv.email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={roleBadgeVariant(inv.role)} className="text-xs">
                        {roleLabel(inv.role)}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {inviteLink && (
        <InviteLinkModal
          inviteUrl={inviteLink.url}
          emailFailed={inviteLink.emailFailed}
          onClose={() => setInviteLink(null)}
        />
      )}
    </div>
  );
}
