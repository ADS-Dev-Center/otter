"use client";

import { useEffect, useMemo, useState } from "react";
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
  createDivisionId,
  DEFAULT_DIVISIONS,
  DIVISION_CONTEXT_EVENT,
  DIVISIONS_STORAGE_KEY,
  type Division,
  getDivisionInitials,
  getDivisionPalette,
  safeParseDivisions,
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
  const [divisions, setDivisions] = useState<Division[]>(DEFAULT_DIVISIONS);
  const [activeDivisionId, setActiveDivisionId] = useState(
    DEFAULT_DIVISIONS[0]?.id ?? "qa",
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newDivisionName, setNewDivisionName] = useState("");
  const [newDivisionDescription, setNewDivisionDescription] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDivisions = safeParseDivisions(
      window.localStorage.getItem(DIVISIONS_STORAGE_KEY),
    );
    const nextDivisions = storedDivisions ?? DEFAULT_DIVISIONS;

    const storedActive = window.localStorage.getItem(
      ACTIVE_DIVISION_STORAGE_KEY,
    );
    const resolvedActive = nextDivisions.some(
      (division) => division.id === storedActive,
    )
      ? storedActive
      : nextDivisions[0]?.id;

    setDivisions(nextDivisions);
    setActiveDivisionId(resolvedActive ?? DEFAULT_DIVISIONS[0]?.id ?? "qa");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncDivisionContext = () => {
      const storedDivisions = safeParseDivisions(
        window.localStorage.getItem(DIVISIONS_STORAGE_KEY),
      );
      const nextDivisions = storedDivisions ?? DEFAULT_DIVISIONS;
      const storedActive = window.localStorage.getItem(
        ACTIVE_DIVISION_STORAGE_KEY,
      );
      const resolvedActive = nextDivisions.some(
        (division) => division.id === storedActive,
      )
        ? storedActive
        : nextDivisions[0]?.id;

      setDivisions(nextDivisions);
      setActiveDivisionId(resolvedActive ?? DEFAULT_DIVISIONS[0]?.id ?? "qa");
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === DIVISIONS_STORAGE_KEY ||
        event.key === ACTIVE_DIVISION_STORAGE_KEY
      ) {
        syncDivisionContext();
      }
    };

    window.addEventListener(DIVISION_CONTEXT_EVENT, syncDivisionContext);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(DIVISION_CONTEXT_EVENT, syncDivisionContext);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      DIVISIONS_STORAGE_KEY,
      JSON.stringify(divisions),
    );
  }, [divisions]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, activeDivisionId);
  }, [activeDivisionId]);

  const activeDivision = useMemo(
    () =>
      divisions.find((d) => d.id === activeDivisionId) ||
      divisions[0] ||
      DEFAULT_DIVISIONS[0],
    [activeDivisionId, divisions],
  );

  const handleDivisionSelect = (divisionId: string) => {
    setActiveDivisionId(divisionId);
    onDivisionChange?.(divisionId);
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(DIVISION_CONTEXT_EVENT, {
          detail: { activeDivisionId: divisionId, divisions },
        }),
      );
    }
    setIsOpen(false);
  };

  const handleCreateDivision = () => {
    const trimmedName = newDivisionName.trim();
    if (!trimmedName) return;

    const palette = getDivisionPalette(divisions.length);
    const newDivision: Division = {
      id: createDivisionId(trimmedName),
      name: trimmedName,
      iconBgClass: palette.iconBgClass,
      iconColor: palette.iconColor,
      accentBarClass: palette.accentBarClass,
      memberCount: 1,
      members: [
        {
          initials: getDivisionInitials(trimmedName),
          gradientFrom: palette.gradientFrom,
          gradientTo: palette.gradientTo,
        },
      ],
    };

    const nextDivisions = [...divisions, newDivision];
    setDivisions(nextDivisions);
    onAddDivision?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(DIVISION_CONTEXT_EVENT, {
          detail: { activeDivisionId, divisions: nextDivisions },
        }),
      );
    }

    // Stay on current division after creating a new one.
    setNewDivisionName("");
    setNewDivisionDescription("");
    setIsCreateOpen(false);
    setIsOpen(false);
  };

  return (
    <div className="relative px-2 py-3 border-b border-(--glass-border-subtle)">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-(--glass-bg-hover) group"
      >
        {/* Division icon */}
        <div
          className={cn(
            "size-8 rounded-lg flex items-center justify-center shrink-0",
            activeDivision.iconBgClass,
          )}
        >
          <Buildings
            weight="duotone"
            size={16}
            color={activeDivision.iconColor}
          />
        </div>

        {/* Division name */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-(--text-primary) truncate">
            {activeDivision.name}
          </p>
          <p className="text-[10px] text-(--text-muted) truncate">
            {activeDivision.memberCount} members
          </p>
        </div>

        {/* Member avatars */}
        <div className="flex items-center -space-x-1 shrink-0">
          {activeDivision.members.slice(0, 3).map((member, idx) => (
            <div
              key={idx}
              className={cn(
                "size-5 rounded-full flex items-center justify-center",
                "text-[7px] font-bold text-white bg-gradient-to-br shrink-0",
                "ring-1 ring-(--glass-border-subtle)",
                member.gradientFrom,
                member.gradientTo,
              )}
            >
              {member.initials}
            </div>
          ))}
          {activeDivision.memberCount > 3 && (
            <div className="size-5 rounded-full flex items-center justify-center text-[7px] font-bold glass shrink-0 ring-1 ring-(--glass-border-subtle) text-(--text-muted)">
              +{Math.max(activeDivision.memberCount - 3, 0)}
            </div>
          )}
        </div>

        {/* Dropdown indicator */}
        <CaretRight
          weight="duotone"
          size={14}
          color="var(--text-muted)"
          className={cn(
            "shrink-0 transition-transform duration-200",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-2 right-2 mt-2 z-50 rounded-lg border border-(--glass-border) bg-(--glass-bg) shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden">
          {divisions.map((division) => {
            const isActive = division.id === activeDivisionId;
            return (
              <button
                key={division.id}
                type="button"
                onClick={() => handleDivisionSelect(division.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-(--glass-bg-active)"
                    : "hover:bg-(--glass-bg-hover)",
                )}
              >
                {/* Division icon */}
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

                {/* Division info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-xs font-semibold truncate",
                      isActive
                        ? "text-(--text-primary)"
                        : "text-(--text-subtle)",
                    )}
                  >
                    {division.name}
                  </p>
                  <p className="text-[10px] text-(--text-muted) truncate">
                    {division.memberCount} members
                  </p>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="size-2 rounded-full bg-(--accent-primary) shrink-0" />
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-(--glass-border-subtle)" />

          {/* Add Division Button */}
          <button
            type="button"
            onClick={() => {
              onAddDivision?.();
              setIsCreateOpen(true);
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-(--glass-bg-hover) text-(--text-subtle) hover:text-(--text-primary)"
          >
            <div className="size-8 rounded-lg flex items-center justify-center shrink-0 bg-(--glass-bg-hover)">
              <Plus weight="duotone" size={16} color="var(--accent-primary)" />
            </div>
            <span className="text-xs font-semibold">Add Division</span>
          </button>
        </div>
      )}

      {isCreateOpen && (
        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) {
              setNewDivisionName("");
              setNewDivisionDescription("");
            }
          }}
        >
          <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
            <DialogHeader>
              <DialogTitle className="text-lg text-(--text-primary)">
                Create Division
              </DialogTitle>
              <DialogDescription className="text-(--text-muted)">
                New division will be created but your current active division remains unchanged.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Division Name
                </label>
                <Input
                  value={newDivisionName}
                  onChange={(event) => setNewDivisionName(event.target.value)}
                  placeholder="e.g. Security Division"
                  className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted)"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Description (optional)
                </label>
                <Input
                  value={newDivisionDescription}
                  onChange={(event) => setNewDivisionDescription(event.target.value)}
                  placeholder="Short description"
                  className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted)"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateDivision}
                disabled={!newDivisionName.trim()}
                className="rounded-lg"
              >
                Create Division
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
