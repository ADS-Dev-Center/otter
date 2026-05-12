"use client";

import { SignOutButton, UserButton, useUser } from "@clerk/nextjs";
import {
  SquaresFour,
  FolderLock,
  UsersThree,
  ClipboardText,
  GearSix,
  Lifebuoy,
  SignOut,
  X,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import DivisionSwitcher from "./DivisionSwitcher";

interface NavItem {
  label: string;
  icon: React.ForwardRefExoticComponent<
    IconProps & React.RefAttributes<SVGSVGElement>
  >;
  href: string;
  isAvailable: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    icon: SquaresFour,
    href: "/dashboard",
    isAvailable: true,
  },
  { label: "Projects", icon: FolderLock, href: "/projects", isAvailable: true },
  { label: "Members", icon: UsersThree, href: "/members", isAvailable: true },
  {
    label: "Audit Log",
    icon: ClipboardText,
    href: "/auditlog",
    isAvailable: true,
  },
];

const bottomItems: NavItem[] = [
  { label: "Settings", icon: GearSix, href: "/settings", isAvailable: true },
  { label: "Support", icon: Lifebuoy, href: "/support", isAvailable: false },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const displayName =
    user?.fullName ?? user?.firstName ?? user?.username ?? "Signed-in User";
  const email = user?.primaryEmailAddress?.emailAddress ?? "No email";

  return (
    <aside className="panel-sidebar pointer-events-auto flex h-full w-60 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-(--glass-border-subtle) px-4">
        <div className="liquid-button flex size-10 items-center justify-center rounded-lg p-1.5">
          <Image
            src="/logo.png"
            alt="Otter logo"
            width={28}
            height={28}
            className="size-full object-contain"
          />
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
          className="liquid-chip ml-auto inline-flex size-8 items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:text-(--text-primary)"
          aria-label="Close sidebar"
        >
          <X weight="duotone" size={16} />
        </button>
      </div>

      <DivisionSwitcher onAddDivision={() => {}} />

      <nav className="flex flex-1 flex-col gap-3 p-2">
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (!item.isAvailable) {
              return (
                <button
                  key={item.href}
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-white transition-colors hover:text-(--text-primary)"
                >
                  <Icon weight="duotone" size={20} color="white" />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </button>
              );
            }

            if (isActive) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="liquid-selected flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white"
                >
                  <Icon weight="duotone" size={20} color="white" />
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex w-full items-center gap-3 px-3 py-2 text-left text-white transition-colors hover:text-(--text-primary)"
              >
                <Icon weight="duotone" size={20} color="white" />
                <span className="text-sm font-medium text-white">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-(--glass-border-subtle) pt-2">
          <div className="flex flex-col gap-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              if (item.isAvailable) {
                if (isActive) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="liquid-selected flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-white"
                    >
                      <Icon weight="duotone" size={20} color="white" />
                      <span className="text-sm font-medium text-white">
                        {item.label}
                      </span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex w-full items-center gap-3 px-3 py-2 text-left text-white transition-colors hover:text-(--text-primary)"
                  >
                    <Icon weight="duotone" size={20} color="white" />
                    <span className="text-sm font-medium text-white">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.href}
                  type="button"
                  disabled
                  title="Coming soon"
                  className="flex w-full items-center gap-3 px-3 py-2 text-left text-white transition-colors hover:text-(--text-primary)"
                >
                  <Icon weight="duotone" size={20} color="white" />
                  <span className="text-sm font-medium text-white">
                    {item.label}
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
              <p className="truncate text-[10px] text-(--text-muted)">
                {email}
              </p>
            </div>
            <SignOutButton>
              <button
                type="button"
                className="transition-opacity hover:opacity-80"
              >
                <SignOut weight="duotone" size={14} color="var(--text-muted)" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </nav>
    </aside>
  );
}
