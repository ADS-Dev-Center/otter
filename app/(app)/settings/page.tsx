"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BellRinging,
  Buildings,
  CheckCircle,
  Database,
  Fingerprint,
  GearSix,
  Key,
  LockKey,
  PencilSimple,
  Plus,
  ShieldCheck,
  Trash,
  UsersThree,
  Waveform,
  WarningCircle,
} from "@phosphor-icons/react";
import { ACTIVE_DIVISION_STORAGE_KEY, DIVISION_CONTEXT_EVENT, type Division } from "@/lib/divisions";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DivisionRow = Division & { role: string };

export default function SettingsPage() {
  const [divisions, setDivisions] = useState<DivisionRow[]>([]);
  const [activeDivisionId, setActiveDivisionId] = useState("");
  const [loading, setLoading] = useState(true);

  // rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // delete state
  const [deletingDivision, setDeletingDivision] = useState<DivisionRow | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // create state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch("/api/divisions");
      if (!res.ok) return;
      const json = (await res.json()) as { data: DivisionRow[] };
      setDivisions(json.data ?? []);

      const storedActive =
        typeof window !== "undefined"
          ? window.localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY)
          : null;
      const fetched = json.data ?? [];
      const resolved = fetched.some((d) => d.id === storedActive)
        ? storedActive!
        : (fetched[0]?.id ?? "");
      setActiveDivisionId(resolved);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDivisions();
  }, [fetchDivisions]);

  // focus rename input when editing starts
  useEffect(() => {
    if (renamingId) {
      setTimeout(() => renameInputRef.current?.focus(), 0);
    }
  }, [renamingId]);

  const activeDivision = divisions.find((d) => d.id === activeDivisionId);

  // ── rename ────────────────────────────────────────────────────────────────
  function startRename(division: DivisionRow) {
    setRenamingId(division.id);
    setRenameValue(division.name);
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    setRenameLoading(true);
    try {
      const res = await fetch(`/api/divisions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) return;
      await fetchDivisions();
      dispatchDivisionChange(activeDivisionId);
    } finally {
      setRenameLoading(false);
      setRenamingId(null);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deletingDivision) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/divisions/${deletingDivision.id}`, { method: "DELETE" });
      const json = (await res.json()) as { error?: { message: string } };
      if (!res.ok) {
        setDeleteError(json.error?.message ?? "Failed to delete division");
        return;
      }
      // If deleted division was active, switch to first remaining
      if (deletingDivision.id === activeDivisionId) {
        const remaining = divisions.filter((d) => d.id !== deletingDivision.id);
        const nextId = remaining[0]?.id ?? "";
        if (nextId && typeof window !== "undefined") {
          window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, nextId);
          dispatchDivisionChange(nextId);
        }
      }
      setDeletingDivision(null);
      setDeleteConfirmName("");
      await fetchDivisions();
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── create ────────────────────────────────────────────────────────────────
  async function handleCreate() {
    const trimmed = createName.trim();
    if (!trimmed) return;
    setCreateLoading(true);
    setCreateError("");
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        setCreateError(json.error?.message ?? "Failed to create division");
        return;
      }
      setIsCreateOpen(false);
      setCreateName("");
      await fetchDivisions();
      dispatchDivisionChange(activeDivisionId);
    } catch {
      setCreateError("An unexpected error occurred");
    } finally {
      setCreateLoading(false);
    }
  }

  function dispatchDivisionChange(id: string) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent(DIVISION_CONTEXT_EVENT, { detail: { activeDivisionId: id } }),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <GearSix weight="duotone" size={24} color="var(--accent-primary)" />
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">Settings</h1>
        </div>
        <p className="text-sm text-(--text-muted)">
          Configure security, division governance, credential policies, and operational controls for Otter.
        </p>
      </header>

      {/* Workspace context */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="text-(--text-primary)">Workspace Context</CardTitle>
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
              {loading ? "—" : `${divisions.length} division${divisions.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <ShieldCheck weight="duotone" size={18} color="var(--accent-primary)" />
              Security & Authentication
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Protect sessions and enforce MFA for all workspace access.
            </CardDescription>
            <CardAction><Badge>Protected</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <Fingerprint weight="duotone" size={14} /> OTP enforcement
              </span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <LockKey weight="duotone" size={14} /> Session duration
              </span>
              <span className="font-medium text-(--text-primary)">8 hours</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <WarningCircle weight="duotone" size={14} /> Suspicious login alerts
              </span>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <Key weight="duotone" size={18} color="var(--accent-teal)" />
              Vault Policy
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Define credential handling and reveal policy for secure operations.
            </CardDescription>
            <CardAction><Badge variant="secondary">AES-256-GCM</Badge></CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Encryption at rest</span>
              <span className="font-medium text-(--text-primary)">Mandatory</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Reveal timeout</span>
              <span className="font-medium text-(--text-primary)">30 seconds</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Copy protection</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <Waveform weight="duotone" size={18} color="var(--accent-amber)" />
              Audit & Compliance
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Track credential access and changes across divisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Audit retention</span>
              <span className="font-medium text-(--text-primary)">180 days</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Reveal activity log</span>
              <Badge variant="secondary">On</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Export reports</span>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <BellRinging weight="duotone" size={18} color="var(--accent-purple)" />
              Notifications & Integrations
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Route operational events to your incident and collaboration tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <CheckCircle weight="duotone" size={14} color="var(--state-success)" />
                Clerk auth integration
              </span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <Database weight="duotone" size={14} />
                Prisma/Postgres health
              </span>
              <Badge variant="secondary">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Slack / Webhook alerts</span>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Division management */}
      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-(--text-primary)">
            <Buildings weight="duotone" size={18} color="var(--accent-primary)" />
            Division Management
          </CardTitle>
          <CardDescription className="text-(--text-muted)">
            Create, rename, or delete your divisions. You must keep at least one division.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              size="sm"
              onClick={() => { setCreateName(""); setIsCreateOpen(true); }}
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
                <div key={i} className="h-14 rounded-lg bg-(--glass-bg-hover) animate-pulse" />
              ))}
            </div>
          )}

          {!loading && divisions.length === 0 && (
            <p className="text-sm text-(--text-muted) py-2">No divisions found.</p>
          )}

          {!loading && divisions.map((division, index) => {
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
                  <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0", division.iconBgClass)}>
                    <Buildings weight="duotone" size={16} color={division.iconColor} />
                  </div>

                  <div className="flex-1 min-w-0">
                    {isRenaming ? (
                      <Input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void commitRename(division.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        disabled={renameLoading}
                        className="h-7 text-sm border-(--glass-border) bg-(--glass-bg) text-(--text-primary) px-2"
                      />
                    ) : (
                      <p className="truncate text-sm font-semibold text-(--text-primary)">
                        {division.name}
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-(--text-muted)">
                      <UsersThree weight="duotone" size={12} />
                      <span>{division.memberCount} {division.memberCount === 1 ? "member" : "members"}</span>
                      {division.role === "DIVISION_OWNER" && (
                        <span className="text-(--accent-primary)">· Owner</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isActive && <Badge variant="secondary" className="text-[10px]">Active</Badge>}

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
                        {divisions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => { setDeleteError(""); setDeleteConfirmName(""); setDeletingDivision(division); }}
                            title="Delete"
                            className="inline-flex size-7 items-center justify-center rounded-lg transition-colors hover:bg-[rgba(240,68,56,0.12)] text-(--text-muted) hover:text-(--state-error)"
                          >
                            <Trash weight="duotone" size={14} />
                          </button>
                        )}
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

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) { setCreateName(""); setCreateError(""); } }}>
        <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
          <DialogHeader>
            <DialogTitle className="text-lg text-(--text-primary)">New Division</DialogTitle>
            <DialogDescription className="text-(--text-muted)">
              Create a new division to group projects and credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">Division name</label>
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && createName.trim()) void handleCreate(); }}
              placeholder="e.g. Security Division"
              className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted)"
              autoFocus
            />
          </div>
          {createError && (
            <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
              {createError}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => { setIsCreateOpen(false); setCreateError(""); }}
              className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)">
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleCreate()}
              disabled={!createName.trim() || createLoading} className="rounded-lg">
              {createLoading ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deletingDivision} onOpenChange={(open) => { if (!open) { setDeletingDivision(null); setDeleteConfirmName(""); setDeleteError(""); } }}>
        <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
          <DialogHeader>
            <DialogTitle className="text-lg text-(--state-error)">Delete Division</DialogTitle>
            <DialogDescription className="text-(--text-muted)">
              This will permanently remove{" "}
              <span className="font-semibold text-(--text-primary)">{deletingDivision?.name}</span>{" "}
              and all its data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Type{" "}
              <span className="font-semibold text-(--text-primary) font-mono">
                {deletingDivision?.name}
              </span>{" "}
              to confirm
            </label>
            <Input
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && deleteConfirmName === deletingDivision?.name) {
                  void confirmDelete();
                }
              }}
              placeholder={deletingDivision?.name}
              className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted)"
              autoFocus
            />
          </div>

          {deleteError && (
            <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
              {deleteError}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => { setDeletingDivision(null); setDeleteConfirmName(""); setDeleteError(""); }}
              className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void confirmDelete()}
              disabled={deleteLoading || deleteConfirmName !== deletingDivision?.name}
              className="rounded-lg bg-(--state-error) hover:opacity-90 text-white disabled:opacity-40"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
