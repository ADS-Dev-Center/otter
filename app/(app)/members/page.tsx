"use client";

import { useEffect, useState } from "react";
import {
  EnvelopeSimple,
  Plus,
  ShieldCheck,
  UsersThree,
} from "@phosphor-icons/react";
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

type MemberRole = "Owner" | "Admin" | "Member";

type RoleOption = {
  value: MemberRole;
  description: string;
};

type Member = {
  id: string;
  name: string;
  email: string;
  title: string;
  initials: string;
  accentClass: string;
  role: MemberRole;
  editable: boolean;
};

const roleOptions: RoleOption[] = [
  { value: "Owner", description: "Full division governance" },
  { value: "Admin", description: "Invite and manage projects" },
  { value: "Member", description: "View assigned projects" },
];

const initialMembers: Member[] = [
  {
    id: "maya",
    name: "Maya Chen",
    email: "maya@otter.dev",
    title: "Division owner",
    initials: "MC",
    accentClass: "bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
    role: "Owner",
    editable: false,
  },
  {
    id: "nathan",
    name: "Nathan Brooks",
    email: "nathan@otter.dev",
    title: "QA platform admin",
    initials: "NB",
    accentClass: "bg-[rgba(45,212,191,0.12)] text-(--accent-teal)",
    role: "Admin",
    editable: true,
  },
  {
    id: "julia",
    name: "Julia Patel",
    email: "julia@otter.dev",
    title: "Automation engineer",
    initials: "JP",
    accentClass: "bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
    role: "Member",
    editable: true,
  },
  {
    id: "aaron",
    name: "Aaron Miles",
    email: "aaron@otter.dev",
    title: "Release tester",
    initials: "AM",
    accentClass: "bg-[rgba(139,92,246,0.12)] text-(--accent-purple)",
    role: "Member",
    editable: true,
  },
];

function getRoleBadgeVariant(role: MemberRole) {
  if (role === "Owner") return "default" as const;
  if (role === "Admin") return "secondary" as const;
  return "outline" as const;
}

function RoleSelectorDialog({
  title,
  description,
  value,
  onSave,
  triggerLabel,
}: {
  title: string;
  description: string;
  value: MemberRole;
  onSave: (role: MemberRole) => void;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [draftRole, setDraftRole] = useState<MemberRole>(value);

  useEffect(() => {
    if (open) {
      setDraftRole(value);
    }
  }, [open, value]);

  function handleSave() {
    onSave(draftRole);
    setOpen(false);
  }

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
      <DialogContent className="rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) text-(--text-primary) sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-(--text-primary)">{title}</DialogTitle>
          <DialogDescription className="text-(--text-muted)">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <RadioGroup
            value={draftRole}
            onValueChange={(nextValue) => setDraftRole(nextValue as MemberRole)}
          >
            {roleOptions.map((role) => {
              const isSelected = draftRole === role.value;
              const inputId = `${title}-${role.value}`
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-");

              return (
                <label
                  key={role.value}
                  htmlFor={inputId}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                    isSelected
                      ? "border-(--accent-primary) bg-(--glass-bg-active)"
                      : "border-(--glass-border-subtle) bg-(--glass-bg) hover:bg-(--glass-bg-hover)",
                  )}
                >
                  <RadioGroupItem
                    id={inputId}
                    value={role.value}
                    className="mt-1"
                  />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-(--text-primary)">
                      {role.value}
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      {role.description}
                    </span>
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

export default function MembersPage() {
  const [members, setMembers] = useState(initialMembers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("Member");

  function updateMemberRole(memberId: string, role: MemberRole) {
    setMembers((currentMembers) =>
      currentMembers.map((member) =>
        member.id === memberId ? { ...member, role } : member,
      ),
    );
  }

  function handleInviteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextEmail = inviteEmail.trim();
    if (!nextEmail) return;

    setInviteEmail("");
    setInviteRole("Member");
  }

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
          Review the people in this division, adjust access for owners and
          admins, and queue email invites for new teammates without leaving the
          current workspace.
        </p>
      </header>

      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="text-(--text-primary)">Invite member</CardTitle>
          <CardDescription className="text-(--text-muted)">
            Admins can queue a new teammate by email and set the starting role.
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
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="name@company.com"
                    className="h-10 rounded-lg border-(--glass-border) bg-(--glass-bg) pl-9 text-(--text-primary) placeholder:text-(--text-muted)"
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
                  />
                  <Badge variant="outline" className="bg-(--glass-bg)">
                    {inviteRole}
                  </Badge>
                </div>
              </div>

              <Button type="submit" size="lg" className="rounded-lg">
                <Plus data-icon="inline-start" weight="duotone" />
                Queue invite
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-(--text-primary)">
            Member list
          </p>
          <p className="text-sm text-(--text-muted)">
            Card-based rows with owner-level role controls.
          </p>
        </div>
        <Badge variant="outline">{members.length} active</Badge>
      </div>

      <div className="flex flex-col gap-4">
        {members.map((member) => (
          <Card
            key={member.id}
            className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)"
          >
            <CardContent className="flex flex-col gap-4 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ring-(--glass-border)",
                      member.accentClass,
                    )}
                  >
                    {member.initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-(--text-primary)">
                        {member.name}
                      </h2>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {member.role}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-(--text-muted)">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-(--text-subtle)">
                      {member.title}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 lg:min-w-72 lg:items-end">
                  {member.editable ? (
                    <RoleSelectorDialog
                      title={`Change role for ${member.name}`}
                      description="Pick the access level for this member."
                      value={member.role}
                      onSave={(nextRole) =>
                        updateMemberRole(member.id, nextRole)
                      }
                      triggerLabel="Change role"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-(--text-muted)">
                      <ShieldCheck
                        weight="duotone"
                        size={14}
                        color="var(--accent-amber)"
                      />
                      Division owner cannot be demoted from this preview.
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-(--glass-border-subtle)" />

              <div className="flex items-center justify-between text-xs text-(--text-muted)">
                <span>
                  Active in QA workspace and scoped to division membership only.
                </span>
                <span className="font-medium text-(--text-primary)">
                  {member.role}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
