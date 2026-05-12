"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { EditProfileDialog } from "@/components/settings/EditProfileDialog";
import {
  Buildings,
  GearSix,
  PencilSimple,
  Plus,
  Trash,
  UsersThree,
} from "@phosphor-icons/react";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DIVISION_CONTEXT_EVENT,
} from "@/lib/divisions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { DangerDialog } from "@/components/ui/danger-dialog";
import { GlassInput } from "@/components/ui/glass-input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  createDivisionAction,
  deleteDivisionAction,
  renameDivisionAction,
} from "@/app/actions/divisions";

type ProfileData = {
  name: string | null;
  email: string | null;
  imageUrl: string | null;
  createdAt: string | null;
};

type DivisionRow = {
  id: string;
  name: string;
  role: string;
  memberCount: number;
  iconBgClass: string;
  iconColor: string;
};

interface Props {
  initialProfile: ProfileData | null;
  initialDivisions: DivisionRow[];
}

const ROLE_LABEL: Record<string, { label: string; color: string }> = {
  DIVISION_OWNER: { label: "Owner", color: "var(--accent-primary)" },
  DIVISION_ADMIN: { label: "Admin", color: "var(--accent-amber)" },
  SUPER_ADMIN: { label: "Super Admin", color: "var(--accent-purple)" },
  MEMBER: { label: "Member", color: "var(--text-muted)" },
};

function RoleBadge({ role }: { role: string }) {
  const { label, color } = ROLE_LABEL[role] ?? {
    label: role,
    color: "var(--text-muted)",
  };
  return (
    <span style={{ color }} className="font-medium">
      {label}
    </span>
  );
}

export function SettingsView({ initialProfile, initialDivisions }: Props) {
  const { user: clerkUser } = useUser();

  const [profile, setProfile] = useState<ProfileData | null>(initialProfile);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const [divisions, setDivisions] = useState<DivisionRow[]>(initialDivisions);
  const [activeDivisionId, setActiveDivisionId] = useState("");
  const [loading, setLoading] = useState(false);

  // rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // delete state
  const [deletingDivision, setDeletingDivision] = useState<DivisionRow | null>(
    null,
  );

  // create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    const storedActive =
      typeof window !== "undefined"
        ? window.localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY)
        : null;
    const resolved = divisions.some((d) => d.id === storedActive)
      ? storedActive!
      : (divisions[0]?.id ?? "");
    setActiveDivisionId(resolved);
  }, [divisions]);

  useEffect(() => {
    if (renamingId) {
      setTimeout(() => renameInputRef.current?.focus(), 0);
    }
  }, [renamingId]);

  const fetchProfile = useCallback(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) {
          setProfile(null);
          return;
        }
        return r.json();
      })
      .then((d) => {
        if (d) setProfile(d as ProfileData);
      })
      .catch(() => setProfile(null));
  }, []);

  const fetchDivisions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/divisions");
      if (!res.ok) return;
      const json = (await res.json()) as { data: DivisionRow[] };
      setDivisions(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  const activeDivision = divisions.find((d) => d.id === activeDivisionId);

  const displayName =
    profile?.name ?? clerkUser?.fullName ?? clerkUser?.username ?? "—";
  const displayEmail =
    profile?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? "—";
  const displayImageUrl = profile?.imageUrl ?? clerkUser?.imageUrl ?? null;
  const memberSince = (() => {
    const raw =
      profile?.createdAt ??
      (clerkUser?.createdAt
        ? new Date(clerkUser.createdAt).toISOString()
        : null);
    if (!raw) return "—";
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  })();

  function startRename(division: DivisionRow) {
    setRenamingId(division.id);
    setRenameValue(division.name);
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setRenameLoading(true);
    try {
      const result = await renameDivisionAction({
        divisionId: id,
        name: trimmed,
      });
      if (!result.ok) {
        toast.error("Failed to rename division", {
          description: result.error.message,
        });
        return;
      }
      toast.success("Division renamed", { description: trimmed });
      await fetchDivisions();
      dispatchDivisionChange(activeDivisionId);
    } finally {
      setRenameLoading(false);
      setRenamingId(null);
    }
  }

  async function handleCreate() {
    const trimmed = createName.trim();
    if (!trimmed) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const result = await createDivisionAction({ name: trimmed });
      if (!result.ok) {
        const msg = result.error?.message ?? "Failed to create division";
        setCreateError(msg);
        toast.error("Failed to create division", { description: msg });
        return;
      }
      setIsCreateOpen(false);
      setCreateName("");
      toast.success("Division created", { description: trimmed });
      await fetchDivisions();
      dispatchDivisionChange(activeDivisionId);
    } catch {
      setCreateError("An unexpected error occurred");
      toast.error("Failed to create division");
    } finally {
      setCreateLoading(false);
    }
  }

  function dispatchDivisionChange(id: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent(DIVISION_CONTEXT_EVENT, {
        detail: { activeDivisionId: id },
      }),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <GearSix weight="duotone" size={24} color="var(--accent-primary)" />
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Settings
          </h1>
        </div>
        <p className="text-sm text-(--text-muted)">
          Manage your profile, workspace context, security policy, and division
          governance.
        </p>
      </header>

      {/* Profile */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardContent className="flex items-center gap-4 py-4">
          {displayImageUrl ? (
            <img
              src={displayImageUrl}
              alt={displayName}
              className="size-12 rounded-full object-cover shrink-0 border border-(--glass-border)"
            />
          ) : (
            <div className="size-12 rounded-full flex items-center justify-center shrink-0 bg-(--glass-bg-hover) border border-(--glass-border) text-(--text-subtle) text-lg font-semibold select-none">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate font-semibold text-(--text-primary) leading-snug">
              {displayName}
            </p>
            <p className="truncate text-xs text-(--text-muted) mt-0.5">
              {displayEmail}
            </p>
            <p className="text-xs text-(--text-muted) mt-0.5">
              Member since{" "}
              <span className="text-(--text-subtle)">{memberSince}</span>
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditProfileOpen(true)}
            className="shrink-0 h-8 px-3 text-xs border-(--glass-border) text-(--text-subtle) hover:text-(--text-primary) hover:bg-(--glass-bg-hover)"
          >
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Workspace context */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="text-(--text-primary)">
            Workspace Context
          </CardTitle>
          <CardDescription className="text-(--text-muted)">
            Otter always scopes data to one active division at a time.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">Scoped Access</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2">
            <span className="text-(--text-muted)">Active division</span>
            <span className="font-semibold text-(--text-primary)">
              {loading ? "—" : (activeDivision?.name ?? "None")}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2">
            <span className="text-(--text-muted)">Division memberships</span>
            <span className="font-semibold text-(--text-primary)">
              {loading
                ? "—"
                : `${divisions.length} division${divisions.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Division management */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-(--text-primary)">
            <Buildings
              weight="duotone"
              size={18}
              color="var(--accent-primary)"
            />
            Division Management
          </CardTitle>
          <CardDescription className="text-(--text-muted)">
            Create, rename, or delete your divisions. You must keep at least one
            division.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setCreateName("");
                setIsCreateOpen(true);
              }}
              className="h-8 gap-1.5 px-3 text-xs bg-(--accent-primary) hover:opacity-90 text-white"
            >
              <Plus weight="bold" size={14} />
              New Division
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {loading && (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-(--glass-bg-hover) animate-pulse"
                />
              ))}
            </div>
          )}

          {!loading && divisions.length === 0 && (
            <p className="text-sm text-(--text-muted) py-2">
              No divisions found.
            </p>
          )}

          {!loading && divisions.length === 1 && (
            <p className="text-xs text-(--text-muted) bg-(--glass-bg-hover) rounded-lg px-3 py-2">
              You need at least two divisions before you can delete one.
            </p>
          )}

          {!loading &&
            divisions.map((division, index) => {
              const isActive = division.id === activeDivisionId;
              const isRenaming = renamingId === division.id;

              return (
                <div key={division.id} className="flex flex-col gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-(--glass-border-subtle) px-3 py-2.5",
                      isActive && "bg-(--glass-bg-active)",
                    )}
                  >
                    <div
                      className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0",
                        division.iconBgClass,
                      )}
                    >
                      <Buildings
                        weight="duotone"
                        size={16}
                        color={division.iconColor}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {isRenaming ? (
                        <GlassInput
                          ref={renameInputRef}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              void commitRename(division.id);
                            if (e.key === "Escape") setRenamingId(null);
                          }}
                          disabled={renameLoading}
                          className="h-7 text-sm px-2"
                        />
                      ) : (
                        <p className="truncate text-sm font-semibold text-(--text-primary)">
                          {division.name}
                        </p>
                      )}
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-(--text-muted)">
                        <UsersThree weight="duotone" size={12} />
                        <span>
                          {division.memberCount}{" "}
                          {division.memberCount === 1 ? "member" : "members"}
                        </span>
                        <span className="text-(--glass-border)">·</span>
                        <RoleBadge role={division.role} />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <Badge variant="secondary" className="text-[10px]">
                          Active
                        </Badge>
                      )}

                      {division.role === "DIVISION_OWNER" && !isRenaming && (
                        <>
                          <button
                            type="button"
                            onClick={() => startRename(division)}
                            title="Rename"
                            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-(--glass-bg-hover) text-(--text-muted) hover:text-(--text-primary)"
                          >
                            <PencilSimple weight="duotone" size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingDivision(division)}
                            disabled={divisions.length <= 1}
                            title={
                              divisions.length <= 1
                                ? "Cannot delete the only division"
                                : "Delete"
                            }
                            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[rgba(240,68,56,0.12)] text-(--text-muted) hover:text-(--state-error) disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-(--text-muted)"
                          >
                            <Trash weight="duotone" size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {index < divisions.length - 1 && (
                    <Separator className="bg-(--glass-border-subtle)" />
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentName={displayName}
        currentEmail={displayEmail}
        currentImageUrl={displayImageUrl}
        onSaved={fetchProfile}
      />

      {/* Create dialog */}
      <GlassDialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            setCreateName("");
            setCreateError("");
          }
        }}
        title="New Division"
        description="Create a new division to group projects and credentials."
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreateOpen(false);
                setCreateError("");
              }}
              className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleCreate()}
              disabled={!createName.trim() || createLoading}
              className="rounded-lg"
            >
              {createLoading ? "Creating…" : "Create"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-subtle)">
            Division name
          </label>
          <GlassInput
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && createName.trim()) void handleCreate();
            }}
            placeholder="e.g. Security Division"
            autoFocus
          />
        </div>
        {createError && (
          <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
            {createError}
          </p>
        )}
      </GlassDialog>

      {/* Delete confirmation dialog */}
      <DangerDialog
        open={!!deletingDivision}
        onOpenChange={(open) => !open && setDeletingDivision(null)}
        title="Delete Division"
        description={`This will permanently remove "${deletingDivision?.name ?? ""}" and all its data. This action cannot be undone.`}
        confirmText={deletingDivision?.name}
        onAction={async () => {
          if (!deletingDivision) return;
          const deletedName = deletingDivision.name;
          const result = await deleteDivisionAction({
            divisionId: deletingDivision.id,
          });
          if (!result.ok) {
            throw new Error(
              result.error.message ?? "Failed to delete division",
            );
          }
          if (deletingDivision.id === activeDivisionId) {
            const remaining = divisions.filter(
              (d) => d.id !== deletingDivision.id,
            );
            const nextId = remaining[0]?.id ?? "";
            if (nextId && typeof window !== "undefined") {
              window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, nextId);
              dispatchDivisionChange(nextId);
            }
          }
          toast.success("Division deleted", { description: deletedName });
          await fetchDivisions();
        }}
      />
    </div>
  );
}
