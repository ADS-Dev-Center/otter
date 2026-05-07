"use client";

import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  SquaresFour,
  Buildings,
  FolderLock,
  Key,
  UsersThree,
  ClipboardText,
  GearSix,
  Lifebuoy,
  SignOut,
  X,
  ShieldChevron,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  href: string;
  isAvailable: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: SquaresFour, href: "/dashboard", isAvailable: true },
  { label: "Divisions", icon: Buildings, href: "/divisions", isAvailable: true },
  { label: "Projects", icon: FolderLock, href: "/projects", isAvailable: false },
  { label: "Credentials", icon: Key, href: "/credentials", isAvailable: false },
  { label: "Members", icon: UsersThree, href: "/members", isAvailable: false },
  { label: "Audit Log", icon: ClipboardText, href: "/audit", isAvailable: false },
];

const bottomItems: NavItem[] = [
  { label: "Settings", icon: GearSix, href: "/settings", isAvailable: false },
  { label: "Support", icon: Lifebuoy, href: "/support", isAvailable: false },
];

const mockDivisions = [
  { name: "QA Division", dotClass: "bg-(--accent-primary)" },
  { name: "Dev Division", dotClass: "bg-(--accent-teal)" },
  { name: "DevOps", dotClass: "bg-(--accent-amber)" },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [activeDivision, setActiveDivision] = useState("QA Division");
  const { user } = useUser();
  const displayName =
    user?.fullName ?? user?.firstName ?? user?.username ?? "Signed-in User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email";

  return (
    <aside
      className="pointer-events-auto flex h-full w-[15rem] flex-col rounded-xl border border-(--glass-border) bg-(--glass-bg) shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md"
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-(--glass-border-subtle) px-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-(--accent-primary)">
          <ShieldChevron weight="duotone" size={22} color="white" />
        </div>
        <div>
          <p className="text-base font-bold leading-tight text-(--text-primary)">
            Otter
          </p>
          <p className="text-[10px] uppercase tracking-widest text-(--text-muted)">
            Vault
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto inline-flex size-8 items-center justify-center rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) text-(--text-muted) transition-colors hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
          aria-label="Close sidebar"
        >
          <X weight="duotone" size={16} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-3 p-2">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const baseClasses = "group flex items-stretch";
            const contentClasses = cn(
              "flex flex-1 items-center gap-3 rounded-lg px-3 py-2 transition-colors",
              item.isAvailable
                ? isActive
                  ? "bg-(--glass-bg-active)"
                  : "group-hover:bg-(--glass-bg-hover)"
                : "bg-transparent"
            );
            const iconColor = !item.isAvailable
              ? "var(--text-subtle)"
              : isActive
                ? "var(--accent-primary)"
                : "var(--text-muted)";

            const labelColor = !item.isAvailable
              ? "text-(--text-muted)"
              : isActive
                ? "text-(--text-primary)"
                : "text-(--text-subtle)";

            if (!item.isAvailable) {
              return (
                <button
                  key={item.href}
                  type="button"
                  disabled
                  title="Coming soon"
                  className={cn(baseClasses, "cursor-not-allowed text-left")}
                >
                  <span className="w-0.5 shrink-0 rounded-r bg-transparent" />
                  <span className={contentClasses}>
                    <Icon weight="duotone" size={20} color={iconColor} />
                    <span className={cn("text-sm font-medium", labelColor)}>
                      {item.label}
                    </span>
                  </span>
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={baseClasses}>
                <span
                  className={cn(
                    "w-0.5 shrink-0 rounded-r",
                    isActive ? "bg-(--accent-primary)" : "bg-transparent"
                  )}
                />
                <span className={contentClasses}>
                  <Icon weight="duotone" size={20} color={iconColor} />
                  <span className={cn("text-sm font-medium", labelColor)}>
                    {item.label}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="px-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-(--text-muted)">
            My Divisions
          </p>
          <div className="flex flex-col gap-0.5">
            {mockDivisions.map((division) => {
              const isDivisionActive = activeDivision === division.name;
              return (
                <button
                  key={division.name}
                  type="button"
                  onClick={() => setActiveDivision(division.name)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-(--glass-bg-hover)"
                >
                  <span className={cn("size-2 shrink-0 rounded-full", division.dotClass)} />
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isDivisionActive ? "text-(--text-primary)" : "text-(--text-subtle)"
                    )}
                  >
                    {division.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto border-t border-(--glass-border-subtle) pt-2">
          <div className="flex flex-col gap-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  type="button"
                  disabled
                  title="Coming soon"
                  className="group flex cursor-not-allowed items-stretch text-left"
                >
                  <span className="w-0.5 shrink-0 rounded-r bg-transparent" />
                  <span className="flex flex-1 items-center gap-3 rounded-lg px-3 py-2 transition-colors">
                    <Icon weight="duotone" size={20} color="var(--text-subtle)" />
                    <span className="text-sm font-medium text-(--text-muted)">
                      {item.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center gap-3 px-3 py-2">
            <UserButton showName={false} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-(--text-primary)">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-(--text-muted)">{email}</p>
            </div>
            <SignOutButton>
              <button type="button" className="transition-opacity hover:opacity-80">
                <SignOut weight="duotone" size={14} color="var(--text-muted)" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>
    </aside>
  );
}
