"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DIVISION_CONTEXT_EVENT,
  type Division,
} from "@/lib/divisions";
import {
  SidebarSimple,
  SquaresFour,
  FolderLock,
  UsersThree,
  ClipboardText,
  GearSix,
  Lifebuoy,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [miniRailDivisions, setMiniRailDivisions] = useState<Division[]>([]);
  const [activeDivisionId, setActiveDivisionId] = useState("");
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
    const fetchAndSync = async () => {
      try {
        const res = await fetch("/api/divisions");
        if (!res.ok) return;
        const json = (await res.json()) as { data: Division[] };
        const fetched = json.data ?? [];
        setMiniRailDivisions(fetched);

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
    };

    void fetchAndSync();

    const onContextChange = (e: Event) => {
      const detail = (e as CustomEvent<{ activeDivisionId: string }>).detail;
      if (detail?.activeDivisionId) {
        setActiveDivisionId(detail.activeDivisionId);
      }
    };

    window.addEventListener(DIVISION_CONTEXT_EVENT, onContextChange);
    return () => window.removeEventListener(DIVISION_CONTEXT_EVENT, onContextChange);
  }, []);

  const getMiniRailDotClass = (division: Division) => {
    switch (division.accentColor) {
      case "teal": return "bg-(--accent-teal)";
      case "amber": return "bg-(--accent-amber)";
      case "purple": return "bg-(--accent-purple)";
      default: return "bg-(--accent-primary)";
    }
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
          <aside className="panel-rail flex h-full w-14 flex-col items-center p-2">
            <div className="liquid-button mb-2 flex size-10 items-center justify-center rounded-full p-1.5">
              <Image
                src="/logo.png"
                alt="Otter logo"
                width={28}
                height={28}
                className="size-full object-contain"
              />
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
                      isActive ? "liquid-selected" : "hover:bg-(--glass-bg-hover)",
                    )}
                  >
                    <Icon
                      weight="duotone"
                      size={18}
                      color={isActive ? "white" : "var(--text-muted)"}
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
                      window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, division.id);
                      window.dispatchEvent(
                        new CustomEvent(DIVISION_CONTEXT_EVENT, {
                          detail: { activeDivisionId: division.id },
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
                      isActive ? "liquid-selected" : "hover:bg-(--glass-bg-hover)",
                    )}
                  >
                    <Icon
                      weight="duotone"
                      size={18}
                      color={isActive ? "white" : "var(--text-muted)"}
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
