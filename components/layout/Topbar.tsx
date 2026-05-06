"use client";

import { useState } from "react";
import {
  MagnifyingGlass,
  ShieldCheck,
} from "@phosphor-icons/react";

export default function Topbar() {
  const [search, setSearch] = useState("");

  return (
    <header
      className="glass h-14 flex items-center px-6 shrink-0 gap-4"
      style={{ borderBottom: "1px solid var(--glass-border-subtle)" }}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          Dashboard
        </span>
        <span className="text-sm" style={{ color: "var(--glass-border)" }}>
          ›
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          QA Division
        </span>
      </div>

      {/* Search */}
      <div className="glass rounded-lg px-3 py-1.5 flex items-center gap-2 w-[220px]">
        <MagnifyingGlass
          weight="duotone"
          size={14}
          color="var(--text-muted)"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: "var(--text-primary)" }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* OTP badge */}
        <div
          className="flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-semibold"
          style={{
            background: "rgba(18,183,106,0.1)",
            border: "1px solid rgba(18,183,106,0.2)",
            color: "var(--state-success)",
          }}
        >
          <ShieldCheck weight="duotone" size={13} />
          OTP Verified
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-teal))",
          }}
        >
          <span className="text-xs font-semibold text-white">RD</span>
        </div>
      </div>
    </header>
  );
}
