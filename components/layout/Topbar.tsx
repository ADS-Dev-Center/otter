"use client";

import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { SidebarSimple, X, MagnifyingGlass } from "@phosphor-icons/react";

const SECTION_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/projects": "Projects",
  "/members": "Members",
  "/auditlog": "Audit Log",
  "/settings": "Settings",
};

function getSectionLabel(pathname: string): string {
  for (const [prefix, label] of Object.entries(SECTION_LABELS)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return label;
  }
  return "Dashboard";
}

interface TopbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeDivisionName?: string;
}

export default function Topbar({
  isSidebarOpen,
  onToggleSidebar,
  activeDivisionName,
}: TopbarProps) {
  const pathname = usePathname();
  const Icon = isSidebarOpen ? X : SidebarSimple;
  const section = getSectionLabel(pathname);

  return (
    <header className="glass-raised h-14 w-full rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]">
      <div className="flex h-full items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            className="liquid-chip inline-flex size-9 items-center justify-center rounded-lg text-(--text-primary) transition-colors hover:text-white"
          >
            <Icon weight="duotone" size={20} />
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm text-(--text-muted)">
              {section}
            </span>
            {activeDivisionName && (
              <>
                <span className="text-sm text-(--glass-border)">/</span>
                <span className="truncate text-sm font-medium text-(--text-primary)">
                  {activeDivisionName}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <label className="flex w-72 items-center gap-2 rounded-lg border border-(--glass-border) bg-(--glass-bg-raised) px-3 py-1.5 backdrop-blur-md transition-colors focus-within:border-[rgba(125,175,255,0.5)] focus-within:bg-(--glass-bg-active)">
            <MagnifyingGlass
              weight="duotone"
              size={14}
              color="var(--text-muted)"
            />
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
