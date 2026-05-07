"use client";

import { UserButton } from "@clerk/nextjs";
import { SidebarSimple, X, MagnifyingGlass } from "@phosphor-icons/react";

interface TopbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Topbar({
  isSidebarOpen,
  onToggleSidebar,
}: TopbarProps) {
  const Icon = isSidebarOpen ? X : SidebarSimple;

  return (
    <header className="glass h-14 w-full rounded-full">
      <div className="flex h-full items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-(--glass-border) bg-(--glass-bg) text-(--text-primary) transition-colors hover:bg-(--glass-bg-hover)"
          >
            <Icon weight="duotone" size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm text-(--text-muted)">Dashboard</span>
            <span className="text-sm text-(--glass-border)">/</span>
            <span className="truncate text-sm font-medium text-(--text-primary)">
              QA Division
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <label className="flex w-72 items-center gap-2 rounded-lg border border-(--glass-border) bg-(--glass-bg) px-3 py-1.5 backdrop-blur-md transition-colors focus-within:border-[rgba(77,142,255,0.45)]">
            <MagnifyingGlass weight="duotone" size={14} color="var(--text-muted)" />
            <input
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-(--text-primary) outline-none placeholder:text-(--text-muted)"
            />
          </label>
          <UserButton showName={false} />
        </div>
      </div>
    </header>
  );
}
