"use client";

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
  ShieldChevron,
} from "@phosphor-icons/react";
import type { IconProps } from "@phosphor-icons/react";

interface NavItem {
  label: string;
  icon: React.ForwardRefExoticComponent<IconProps & React.RefAttributes<SVGSVGElement>>;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: SquaresFour, href: "/dashboard" },
  { label: "Divisions", icon: Buildings, href: "/divisions" },
  { label: "Projects", icon: FolderLock, href: "/projects" },
  { label: "Credentials", icon: Key, href: "/credentials" },
  { label: "Members", icon: UsersThree, href: "/members" },
  { label: "Audit Log", icon: ClipboardText, href: "/audit" },
];

const bottomItems: NavItem[] = [
  { label: "Settings", icon: GearSix, href: "/settings" },
  { label: "Support", icon: Lifebuoy, href: "/support" },
];

const mockDivisions = [
  { name: "QA Division", color: "var(--accent-primary)" },
  { name: "Dev Division", color: "var(--accent-teal)" },
  { name: "DevOps", color: "var(--accent-amber)" },
];

function NavButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className="group flex items-center w-full text-left"
    >
      <div
        className="w-0.5 self-stretch shrink-0 rounded-r"
        style={{
          background: isActive ? "var(--accent-primary)" : "transparent",
        }}
      />
      <div
        className={`flex items-center gap-3 py-2 pl-3 pr-4 flex-1 rounded-lg transition-colors duration-100 ${
          !isActive ? "group-hover:bg-(--glass-bg-hover)" : ""
        }`}
        style={{
          background: isActive ? "var(--glass-bg-active)" : "transparent",
        }}
      >
        <Icon
          weight="duotone"
          size={20}
          color={isActive ? "var(--accent-primary)" : "var(--text-muted)"}
        />
        <span
          className="text-sm font-medium"
          style={{
            color: isActive ? "var(--text-primary)" : "var(--text-subtle)",
          }}
        >
          {item.label}
        </span>
      </div>
    </button>
  );
}

export default function Sidebar() {
  const [activeHref, setActiveHref] = useState("/dashboard");
  const [activeDivision, setActiveDivision] = useState("QA Division");

  return (
    <aside
      className="glass w-60 h-screen sticky top-0 flex flex-col shrink-0"
    >
      {/* Logo area */}
      <div
        className="flex items-center gap-3 px-4 h-14 shrink-0"
        style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "var(--accent-primary)" }}
        >
          <ShieldChevron weight="duotone" size={22} color="white" />
        </div>
        <div>
          <p
            className="font-bold text-base leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Otter
          </p>
          <p
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Vault
          </p>
        </div>
      </div>

      {/* Main nav items */}
      <nav className="flex flex-col py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            isActive={activeHref === item.href}
            onClick={() => setActiveHref(item.href)}
          />
        ))}
      </nav>

      {/* My Divisions sub-section */}
      <div className="px-4 pt-2 pb-1">
        <p
          className="text-[10px] uppercase tracking-widest font-semibold mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          My Divisions
        </p>
        <div className="flex flex-col gap-0.5">
          {mockDivisions.map((div) => {
            const isActive = activeDivision === div.name;
            return (
              <button
                key={div.name}
                onClick={() => setActiveDivision(div.name)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-100 w-full text-left hover:bg-(--glass-bg-hover)"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: div.color }}
                />
                <span
                  className="text-xs font-medium"
                  style={{
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-subtle)",
                  }}
                >
                  {div.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom section */}
      <div
        className="mt-auto flex flex-col pt-2"
        style={{ borderTop: "1px solid var(--glass-border-subtle)" }}
      >
        {bottomItems.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            isActive={activeHref === item.href}
            onClick={() => setActiveHref(item.href)}
          />
        ))}

        {/* User row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-primary), var(--accent-teal))",
            }}
          >
            <span className="text-xs font-semibold text-white">RD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Rizky Dwi
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              Division Admin
            </p>
          </div>
          <button className="ml-auto hover:opacity-80 transition-opacity">
            <SignOut
              weight="duotone"
              size={14}
              color="var(--text-muted)"
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
