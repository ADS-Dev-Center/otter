"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarSimple,
  ShieldChevron,
  SquaresFour,
  Buildings,
  FolderLock,
  Key,
  UsersThree,
  ClipboardText,
  GearSix,
  Lifebuoy,
} from "@phosphor-icons/react";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const miniRailItems = [
    { href: "/dashboard", icon: SquaresFour, isAvailable: true },
    { href: "/divisions", icon: Buildings, isAvailable: true },
    { href: "/projects", icon: FolderLock, isAvailable: false },
    { href: "/credentials", icon: Key, isAvailable: false },
    { href: "/members", icon: UsersThree, isAvailable: false },
    { href: "/audit", icon: ClipboardText, isAvailable: false },
  ];
  const miniRailBottomItems = [
    { href: "/settings", icon: GearSix, isAvailable: false },
    { href: "/support", icon: Lifebuoy, isAvailable: false },
  ];
  const miniRailDivisions = [
    { colorClass: "bg-(--accent-primary)", label: "QA Division" },
    { colorClass: "bg-(--accent-teal)", label: "Dev Division" },
    { colorClass: "bg-(--accent-amber)", label: "DevOps Division" },
  ];

  return (
    <div className="relative flex h-screen gap-3 overflow-hidden p-4">
      <div
        className={`h-full transition-[width] duration-200 ease-out ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {isSidebarOpen ? (
          <div className="h-full">
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        ) : (
          <aside className="glass flex h-full w-14 flex-col items-center rounded-full border border-(--glass-border) p-2">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-(--accent-primary)">
              <ShieldChevron weight="duotone" size={20} color="white" />
            </div>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-(--glass-border-subtle) bg-(--glass-bg) text-(--text-primary) transition-colors hover:bg-(--glass-bg-hover)"
              aria-label="Open sidebar"
            >
              <SidebarSimple weight="duotone" size={20} />
            </button>

            <Separator className="my-3 w-8 bg-(--glass-border-subtle)" />

            <nav className="flex flex-col gap-2">
              {miniRailItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href && item.isAvailable;
                const baseClasses =
                  "inline-flex size-10 items-center justify-center rounded-full transition-colors";

                if (!item.isAvailable) {
                  return (
                    <span
                      key={item.href}
                      className={cn(
                        baseClasses,
                        "cursor-not-allowed opacity-50",
                      )}
                      title="Coming soon"
                    >
                      <Icon
                        weight="duotone"
                        size={18}
                        color="var(--text-muted)"
                      />
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      baseClasses,
                      isActive
                        ? "bg-(--glass-bg-active)"
                        : "hover:bg-(--glass-bg-hover)",
                    )}
                  >
                    <Icon
                      weight="duotone"
                      size={18}
                      color={
                        isActive ? "var(--accent-primary)" : "var(--text-muted)"
                      }
                    />
                  </Link>
                );
              })}
            </nav>

            <Separator className="my-3 w-8 bg-(--glass-border-subtle)" />

            <div className="flex flex-col items-center gap-2">
              {miniRailDivisions.map((division) => (
                <span
                  key={division.label}
                  className={cn("size-2.5 rounded-full", division.colorClass)}
                  title={division.label}
                />
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-1">
              {miniRailBottomItems.map((item) => {
                const Icon = item.icon;
                const buttonClasses =
                  "inline-flex size-10 items-center justify-center rounded-full transition-colors";

                if (!item.isAvailable) {
                  return (
                    <span
                      key={item.href}
                      className={cn(
                        buttonClasses,
                        "cursor-not-allowed opacity-70",
                      )}
                      title="Coming soon"
                    >
                      <Icon
                        weight="duotone"
                        size={18}
                        color="var(--text-subtle)"
                      />
                    </span>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(buttonClasses, "hover:bg-(--glass-bg-hover)")}
                  >
                    <Icon
                      weight="duotone"
                      size={18}
                      color="var(--text-muted)"
                    />
                  </Link>
                );
              })}

              <div className="flex justify-center pt-1">
                <UserButton
                  showName={false}
                  appearance={{
                    elements: {
                      userButtonTrigger: "!size-10 !p-0",
                      userButtonBox: "!gap-0",
                      userButtonAvatarBox: "!size-10",
                      userButtonAvatarImage: "!size-10",
                    },
                  }}
                />
              </div>
            </div>
          </aside>
        )}
      </div>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <main className="min-w-0 flex-1 overflow-y-auto rounded-xl p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
