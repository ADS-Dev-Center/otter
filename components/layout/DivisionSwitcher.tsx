"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Buildings, CaretRight, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DIVISION_CONTEXT_EVENT,
  type Division,
  getDivisionInitials,
  getDivisionPalette,
} from "@/lib/divisions";
import { cn } from "@/lib/utils";

interface DivisionSwitcherProps {
  onDivisionChange?: (divisionId: string) => void;
  onAddDivision?: () => void;
}

export default function DivisionSwitcher({
  onDivisionChange,
  onAddDivision,
}: DivisionSwitcherProps) {
  const router = useRouter();
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [activeDivisionId, setActiveDivisionId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch("/api/divisions");
      if (!res.ok) return;
      const json = (await res.json()) as { data: Division[] };
      const fetched = json.data ?? [];
      setDivisions(fetched);

      const storedActive =
        typeof window !== "undefined"
          ? window.localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY)
          : null;

      const resolved = fetched.some((d) => d.id === storedActive)
        ? storedActive!
        : (fetched[0]?.id ?? "");
      setActiveDivisionId(resolved);
    } catch {
      // keep existing state
    }
  }, []);

  useEffect(() => {
    void fetchDivisions();
  }, [fetchDivisions]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onContextChange = () => {
      const storedActive = window.localStorage.getItem(
        ACTIVE_DIVISION_STORAGE_KEY,
      );
      if (storedActive) setActiveDivisionId(storedActive);
    };

    window.addEventListener(DIVISION_CONTEXT_EVENT, onContextChange);
    return () =>
      window.removeEventListener(DIVISION_CONTEXT_EVENT, onContextChange);
  }, []);

  const activeDivision = useMemo(
    () => divisions.find((d) => d.id === activeDivisionId) ?? divisions[0],
    [activeDivisionId, divisions],
  );

  const handleDivisionSelect = (divisionId: string) => {
    const isChanging = divisionId !== activeDivisionId;
    setActiveDivisionId(divisionId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, divisionId);
      window.dispatchEvent(
        new CustomEvent(DIVISION_CONTEXT_EVENT, {
          detail: { activeDivisionId: divisionId },
        }),
      );
    }
    onDivisionChange?.(divisionId);
    setIsOpen(false);
    if (isChanging) {
      router.push("/dashboard");
    }
  };

  const handleCreateDivision = async () => {
    const trimmedName = newDivisionName.trim();
    if (!trimmedName) return;

    setIsCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: { message?: string } };
        setCreateError(json.error?.message ?? "Failed to create division");
        return;
      }
      await fetchDivisions();
      onAddDivision?.();
      setNewDivisionName("");
      setIsCreateOpen(false);
      setIsOpen(false);
    } catch {
      setCreateError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  if (!activeDivision) {
    return (
      <div className="px-2 py-3 border-b border-(--glass-border-subtle)">
        <div className="h-10 rounded-lg bg-(--glass-bg) animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative px-2 py-3 border-b border-(--glass-border-subtle)">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 transition-all duration-150 hover:border-(--glass-border-subtle) hover:bg-(--glass-bg-hover)"
      >
        <div
          className={cn(
            "size-8 shrink-0 rounded-lg flex items-center justify-center",
            activeDivision.iconBgClass,
          )}
        >
          <Buildings
            weight="duotone"
            size={16}
            color={activeDivision.iconColor}
          />
        </div>

        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-(--text-primary) truncate">
            {activeDivision.name}
          </p>
          <p className="text-[10px] text-(--text-muted) truncate">
            {activeDivision.memberCount}{" "}
            {activeDivision.memberCount === 1 ? "member" : "members"}
          </p>
        </div>

        <div className="flex shrink-0 items-center -space-x-1">
          {activeDivision.members.slice(0, 3).map((member) => (
            <div
              key={`${member.initials}-${member.gradientFrom}`}
              className={cn(
                "size-5 rounded-full flex items-center justify-center",
                "text-[7px] font-bold text-white bg-linear-to-br shrink-0",
                "ring-1 ring-(--glass-border-subtle)",
                member.gradientFrom,
                member.gradientTo,
              )}
            >
              {member.initials}
            </div>
          ))}
          {activeDivision.memberCount > 3 && (
            <div className="glass flex size-5 shrink-0 items-center justify-center rounded-full text-[7px] font-bold text-(--text-muted) ring-1 ring-(--glass-border-subtle)">
              +{activeDivision.memberCount - 3}
            </div>
          )}
        </div>

        <CaretRight
          weight="duotone"
          size={14}
          color="var(--text-muted)"
          className={cn(
            "shrink-0 transition-transform duration-200 ease-out",
            isOpen
              ? "rotate-90 opacity-70"
              : "opacity-40 group-hover:opacity-70",
          )}
        />
      </button>

      {isOpen && (
        <div className="panel-dropdown absolute left-0 right-0 top-full z-50 mt-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* top edge highlight */}
          <div className="h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.22),transparent)]" />

          <div className="flex flex-col gap-0.5 p-1.5">
            {divisions.map((division) => {
              const isActive = division.id === activeDivisionId;
              return (
                <button
                  key={division.id}
                  type="button"
                  onClick={() => handleDivisionSelect(division.id)}
                  className={cn(
                    "group relative flex w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 py-2.5 text-left transition-all duration-100",
                    isActive
                      ? "bg-[rgba(77,142,255,0.12)]"
                      : "hover:bg-[rgba(255,255,255,0.05)]",
                  )}
                >
                  {isActive && (
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-(--accent-primary) shadow-[0_0_8px_var(--accent-primary)]" />
                  )}

                  <div className={cn("size-8 shrink-0 rounded-lg flex items-center justify-center", division.iconBgClass)}>
                    <Buildings weight="duotone" size={16} color={division.iconColor} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn(
                      "truncate text-xs font-semibold transition-colors",
                      isActive ? "text-(--text-primary)" : "text-(--text-subtle) group-hover:text-(--text-primary)",
                    )}>
                      {division.name}
                    </p>
                    <p className="truncate text-[10px] text-(--text-muted)">
                      {division.memberCount} {division.memberCount === 1 ? "member" : "members"}
                    </p>
                  </div>

                  {isActive && (
                    <div className="size-1.5 shrink-0 rounded-full bg-(--accent-primary) shadow-[0_0_6px_var(--accent-primary)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mx-3 h-px bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.07),transparent)]" />

          <div className="p-1.5">
            <button
              type="button"
              onClick={() => { onAddDivision?.(); setIsCreateOpen(true); setIsOpen(false); }}
              className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-all duration-100 hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[rgba(77,142,255,0.10)] transition-colors group-hover:bg-[rgba(77,142,255,0.16)]">
                <Plus weight="duotone" size={16} color="var(--accent-primary)" />
              </div>
              <span className="text-xs font-semibold text-(--text-muted) transition-colors group-hover:text-(--text-primary)">
                Add Division
              </span>
            </button>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setNewDivisionName("");
          }}
        >
          <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
            <DialogHeader>
              <DialogTitle className="text-lg text-(--text-primary)">
                Create Division
              </DialogTitle>
              <DialogDescription className="text-(--text-muted)">
                Your active division stays unchanged after creating a new one.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Division Name
                </label>
                <Input
                  value={newDivisionName}
                  onChange={(e) => setNewDivisionName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newDivisionName.trim()) {
                      void handleCreateDivision();
                    }
                  }}
                  placeholder="e.g. Security Division"
                  className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted)"
                  autoFocus
                />
              </div>
            </div>

            {createError && (
            <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
              {createError}
            </p>
          )}
          <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setIsCreateOpen(false); setCreateError(""); }}
                className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => void handleCreateDivision()}
                disabled={!newDivisionName.trim() || isCreating}
                className="rounded-lg"
              >
                {isCreating ? "Creating…" : "Create Division"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
