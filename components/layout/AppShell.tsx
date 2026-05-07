"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DEFAULT_DIVISIONS,
  DIVISION_CONTEXT_EVENT,
  DIVISIONS_STORAGE_KEY,
  safeParseDivisions,
  type Division,
} from "@/lib/divisions";
import {
  SidebarSimple,
  ShieldChevron,
  SquaresFour,
  FolderLock,
  UsersThree,
  ClipboardText,
  GearSix,
  Lifebuoy,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [miniRailDivisions, setMiniRailDivisions] =
    useState<Division[]>(DEFAULT_DIVISIONS);
  const [activeDivisionId, setActiveDivisionId] = useState(
    DEFAULT_DIVISIONS[0]?.id ?? "qa",
  );
  const pathname = usePathname();

  const miniRailItems = [
    { href: "/dashboard", icon: SquaresFour, isAvailable: true },
    { href: "/projects", icon: FolderLock, isAvailable: true },
    { href: "/members", icon: UsersThree, isAvailable: false },
    { href: "/auditlog", icon: ClipboardText, isAvailable: true },
  ];
  const miniRailBottomItems = [
    { href: "/settings", icon: GearSix, isAvailable: true },
    { href: "/support", icon: Lifebuoy, isAvailable: false },
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDivisions = safeParseDivisions(
      window.localStorage.getItem(DIVISIONS_STORAGE_KEY),
    );
    if (storedDivisions) {
      setMiniRailDivisions(storedDivisions);
    }

    const storedActiveDivisionId = window.localStorage.getItem(
      ACTIVE_DIVISION_STORAGE_KEY,
    );
    if (storedActiveDivisionId) {
      setActiveDivisionId(storedActiveDivisionId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncDivisionContext = () => {
      const storedDivisions = safeParseDivisions(
        window.localStorage.getItem(DIVISIONS_STORAGE_KEY),
      );
      const nextDivisions = storedDivisions ?? DEFAULT_DIVISIONS;
      const storedActiveDivisionId = window.localStorage.getItem(
        ACTIVE_DIVISION_STORAGE_KEY,
      );

      setMiniRailDivisions(nextDivisions);
      setActiveDivisionId(
        nextDivisions.some((division) => division.id === storedActiveDivisionId)
          ? (storedActiveDivisionId ?? nextDivisions[0]?.id ?? "qa")
          : (nextDivisions[0]?.id ?? "qa"),
      );
    };

    const onCustomDivisionContextChange = () => {
      syncDivisionContext();
    };

    const onStorage = (event: StorageEvent) => {
      if (
        event.key === DIVISIONS_STORAGE_KEY ||
        event.key === ACTIVE_DIVISION_STORAGE_KEY
      ) {
        syncDivisionContext();
      }
    };

    window.addEventListener(
      DIVISION_CONTEXT_EVENT,
      onCustomDivisionContextChange,
    );
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(
        DIVISION_CONTEXT_EVENT,
        onCustomDivisionContextChange,
      );
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const getMiniRailDotClass = (division: Division) => {
    if (division.accentBarClass.includes("teal")) return "bg-(--accent-teal)";
    if (division.accentBarClass.includes("amber")) return "bg-(--accent-amber)";
    if (division.accentBarClass.includes("purple"))
      return "bg-(--accent-purple)";
    return "bg-(--accent-primary)";
  };

  return (
    <div className="relative flex h-dvh min-h-0 gap-3 overflow-hidden p-4">
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
                <button
                  key={division.id}
                  type="button"
                  onClick={() => {
                    setActiveDivisionId(division.id);
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem(
                        ACTIVE_DIVISION_STORAGE_KEY,
                        division.id,
                      );
                      window.dispatchEvent(
                        new CustomEvent(DIVISION_CONTEXT_EVENT, {
                          detail: {
                            activeDivisionId: division.id,
                            divisions: miniRailDivisions,
                          },
                        }),
                      );
                    }
                  }}
                  className={cn(
                    "rounded-full p-0.5 transition-transform hover:scale-110",
                    activeDivisionId === division.id
                      ? "ring-1 ring-(--glass-border)"
                      : "ring-0",
                  )}
                  title={`Switch to ${division.name}`}
                >
                  <span
                    className={cn(
                      "block size-2.5 rounded-full",
                      getMiniRailDotClass(division),
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-1">
              {miniRailBottomItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href && item.isAvailable;
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
                    className={cn(
                      buttonClasses,
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
      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <main className="h-full min-h-0 w-full overflow-y-auto rounded-xl p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
