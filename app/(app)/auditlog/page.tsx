"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  ClipboardText,
  CopySimple,
  Eye,
  MagnifyingGlass,
  PencilSimple,
  PlusCircle,
  Trash,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type AuditAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE" | "COPY";
type AuditResourceType = "CREDENTIAL" | "PROJECT" | "MEMBER" | "DIVISION";

type AuditEntry = {
  id: string;
  timestamp: Date;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  resourceName: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  divisionId: string;
  divisionName: string;
  details?: {
    oldValue?: string;
    newValue?: string;
    changeDescription?: string;
  };
};

/* ------------------------------------------------------------------ */
/*  Constants & meta                                                   */
/* ------------------------------------------------------------------ */

const ACTION_META: Record<AuditAction, { label: string; icon: typeof Eye; badgeClass: string }> = {
  VIEW: {
    label: "View",
    icon: Eye,
    badgeClass: "border-[rgba(77,142,255,0.2)] bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
  },
  CREATE: {
    label: "Create",
    icon: PlusCircle,
    badgeClass: "border-[rgba(18,183,106,0.2)] bg-[rgba(18,183,106,0.12)] text-(--state-success)",
  },
  UPDATE: {
    label: "Update",
    icon: PencilSimple,
    badgeClass: "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
  },
  DELETE: {
    label: "Delete",
    icon: Trash,
    badgeClass: "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.12)] text-(--state-error)",
  },
  COPY: {
    label: "Copy",
    icon: CopySimple,
    badgeClass: "border-[rgba(154,170,196,0.18)] bg-[rgba(154,170,196,0.1)] text-(--text-subtle)",
  },
};

const RESOURCE_LABELS: Record<AuditResourceType, string> = {
  CREDENTIAL: "Credential",
  PROJECT: "Project",
  MEMBER: "Member",
  DIVISION: "Division",
};

const DIVISION_BADGE: Record<string, string> = {
  qa: "bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
  dev: "bg-[rgba(45,212,191,0.12)] text-(--accent-teal)",
  ops: "bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
};

const DIVISIONS = [
  { id: "all", name: "All Divisions" },
  { id: "qa", name: "QA" },
  { id: "dev", name: "Dev" },
  { id: "ops", name: "DevOps" },
  { id: "design", name: "Design" },
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const SEED: AuditEntry[] = [
  { id: "a01", timestamp: new Date(), action: "VIEW", resourceType: "CREDENTIAL", resourceId: "cred-101", resourceName: "Stripe Live API Key", actorId: "u1", actorName: "Maya Chen", actorEmail: "maya@otter.dev", divisionId: "qa", divisionName: "QA", details: { changeDescription: "Revealed the masked secret." } },
  { id: "a02", timestamp: new Date(), action: "CREATE", resourceType: "PROJECT", resourceId: "proj-208", resourceName: "Payments Sandbox", actorId: "u2", actorName: "Nathan Brooks", actorEmail: "nathan@otter.dev", divisionId: "dev", divisionName: "Dev", details: { changeDescription: "Created a new project." } },
  { id: "a03", timestamp: new Date(), action: "UPDATE", resourceType: "CREDENTIAL", resourceId: "cred-122", resourceName: "GitHub Deploy Token", actorId: "u3", actorName: "Julia Patel", actorEmail: "julia@otter.dev", divisionId: "ops", divisionName: "DevOps", details: { oldValue: "ghp_old_••••", newValue: "ghp_new_••••", changeDescription: "Rotated deployment token." } },
  { id: "a04", timestamp: new Date(), action: "DELETE", resourceType: "MEMBER", resourceId: "m-044", resourceName: "Ava Richardson", actorId: "u1", actorName: "Maya Chen", actorEmail: "maya@otter.dev", divisionId: "qa", divisionName: "QA", details: { changeDescription: "Removed inactive contractor." } },
  { id: "a05", timestamp: new Date(), action: "COPY", resourceType: "CREDENTIAL", resourceId: "cred-133", resourceName: "Datadog API Key", actorId: "u4", actorName: "Aaron Miles", actorEmail: "aaron@otter.dev", divisionId: "ops", divisionName: "DevOps", details: { changeDescription: "Copied credential to clipboard." } },
  { id: "a06", timestamp: new Date(), action: "VIEW", resourceType: "PROJECT", resourceId: "proj-301", resourceName: "Mobile Release", actorId: "u5", actorName: "Lina Foster", actorEmail: "lina@otter.dev", divisionId: "design", divisionName: "Design", details: { changeDescription: "Reviewed project metadata." } },
  { id: "a07", timestamp: new Date(), action: "CREATE", resourceType: "CREDENTIAL", resourceId: "cred-144", resourceName: "Linear Webhook Secret", actorId: "u2", actorName: "Nathan Brooks", actorEmail: "nathan@otter.dev", divisionId: "dev", divisionName: "Dev", details: { changeDescription: "Added webhook secret." } },
  { id: "a08", timestamp: new Date(), action: "UPDATE", resourceType: "DIVISION", resourceId: "div-qa", resourceName: "QA", actorId: "u1", actorName: "Maya Chen", actorEmail: "maya@otter.dev", divisionId: "qa", divisionName: "QA", details: { oldValue: "QA Division", newValue: "Quality Engineering", changeDescription: "Renamed division." } },
  { id: "a09", timestamp: new Date(), action: "DELETE", resourceType: "CREDENTIAL", resourceId: "cred-155", resourceName: "Old Slack Webhook", actorId: "u3", actorName: "Julia Patel", actorEmail: "julia@otter.dev", divisionId: "ops", divisionName: "DevOps", details: { changeDescription: "Deleted deprecated webhook." } },
  { id: "a10", timestamp: new Date(), action: "CREATE", resourceType: "DIVISION", resourceId: "div-sup", resourceName: "Support", actorId: "u1", actorName: "Maya Chen", actorEmail: "maya@otter.dev", divisionId: "qa", divisionName: "QA", details: { changeDescription: "Provisioned new division." } },
  { id: "a11", timestamp: new Date(), action: "VIEW", resourceType: "MEMBER", resourceId: "m-051", resourceName: "Priya Shah", actorId: "u5", actorName: "Lina Foster", actorEmail: "lina@otter.dev", divisionId: "design", divisionName: "Design", details: { changeDescription: "Checked member role." } },
  { id: "a12", timestamp: new Date(), action: "COPY", resourceType: "PROJECT", resourceId: "proj-277", resourceName: "Staging Gateway", actorId: "u4", actorName: "Aaron Miles", actorEmail: "aaron@otter.dev", divisionId: "dev", divisionName: "Dev", details: { changeDescription: "Copied project name." } },
];

const now = Date.now();
const MOCK_ENTRIES = Array.from({ length: 48 }, (_, i) => ({
  ...SEED[i % SEED.length],
  id: `${SEED[i % SEED.length].id}-${i}`,
  timestamp: new Date(now - i * 7 * 60 * 60 * 1000),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function relativeTime(d: Date) {
  const s = Math.abs(Math.round((d.getTime() - Date.now()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const day = Math.round(h / 24);
  return `${day}d ago`;
}

function matchesDateRange(ts: Date, range: string) {
  if (range === "all") return true;
  const ms = { "24h": 864e5, "7d": 6048e5, "30d": 2592e6 }[range];
  return ms ? ts.getTime() >= Date.now() - ms : true;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AuditLogPage() {
  const [ready, setReady] = useState(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [division, setDivision] = useState("all");
  const [actionFilter, setActionFilter] = useState<AuditAction | "ALL">("ALL");
  const [resourceFilter, setResourceFilter] = useState<AuditResourceType | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const perPage = 15;

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400);
    return () => clearTimeout(t);
  }, []);


  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MOCK_ENTRIES.filter((e) => {
      if (q && ![e.actorName, e.actorEmail, e.resourceName, e.action].some((v) => v.toLowerCase().includes(q))) return false;
      if (!matchesDateRange(e.timestamp, dateRange)) return false;
      if (division !== "all" && e.divisionId !== division) return false;
      if (actionFilter !== "ALL" && e.action !== actionFilter) return false;
      if (resourceFilter !== "ALL" && e.resourceType !== resourceFilter) return false;
      return true;
    });
  }, [search, dateRange, division, actionFilter, resourceFilter]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const rangeStart = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, total);

  const hasActiveFilters = search || dateRange !== "30d" || division !== "all" || actionFilter !== "ALL" || resourceFilter !== "ALL";

  function clearAll() {
    setSearch("");
    setDateRange("30d");
    setDivision("all");
    setActionFilter("ALL");
    setResourceFilter("ALL");
    setPage(1);
  }

  /* Loading skeleton */
  if (!ready) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2.5">
          <ClipboardText weight="duotone" size={24} color="var(--accent-primary)" />
          <Skeleton className="h-7 w-32 rounded-lg bg-(--glass-bg-hover)" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg bg-(--glass-bg-hover)" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full bg-(--glass-bg-hover)" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg bg-(--glass-bg-hover)" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[rgba(77,142,255,0.15)]">
              <ClipboardText weight="duotone" size={18} color="var(--accent-primary)" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-(--text-primary)">Audit Log</h1>
          </div>
          <p className="mt-1 text-sm text-(--text-subtle)">Track all actions across credentials, projects, and members.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-1 text-xs font-medium text-(--text-subtle)">
            {total} entries
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-lg border border-(--glass-border) bg-(--glass-bg) px-3 py-1.5 text-xs font-medium text-(--text-subtle) transition-colors hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
            >
              <X weight="bold" size={12} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Toolbar: search + dropdowns ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-(--glass-border) bg-(--glass-bg) p-3 backdrop-blur-md sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass
            weight="duotone"
            size={16}
            color="var(--text-muted)"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by actor, resource, or action…"
            className="h-9 w-full rounded-lg border border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] pl-9 pr-3 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent-primary) focus:ring-1 focus:ring-[rgba(77,142,255,0.2)]"
          />
        </div>

        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[130px] rounded-lg border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] text-sm text-(--text-primary)">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={division} onValueChange={(v) => { setDivision(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] text-sm text-(--text-primary)">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {DIVISIONS.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Filter pills ── */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-(--text-muted)">Action</span>
        {(["ALL", "VIEW", "CREATE", "UPDATE", "DELETE", "COPY"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => { setActionFilter(a); setPage(1); }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              actionFilter === a
                ? a === "ALL"
                  ? "bg-(--accent-primary) text-white shadow-[0_0_8px_rgba(77,142,255,0.3)]"
                  : cn(ACTION_META[a].badgeClass, "shadow-sm")
                : "border border-(--glass-border) text-(--text-subtle) hover:border-[rgba(255,255,255,0.18)] hover:bg-(--glass-bg-hover) hover:text-(--text-primary)",
            )}
          >
            {a === "ALL" ? "All" : ACTION_META[a].label}
          </button>
        ))}

        <div className="mx-1 hidden h-5 w-px bg-(--glass-border) sm:block" />

        <span className="text-[11px] font-semibold uppercase tracking-widest text-(--text-muted)">Resource</span>
        {(["ALL", "CREDENTIAL", "PROJECT", "MEMBER", "DIVISION"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => { setResourceFilter(r); setPage(1); }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              resourceFilter === r
                ? "border border-(--accent-primary) bg-(--glass-bg-active) text-(--accent-primary) shadow-[0_0_8px_rgba(77,142,255,0.15)]"
                : "border border-(--glass-border) text-(--text-subtle) hover:border-[rgba(255,255,255,0.18)] hover:bg-(--glass-bg-hover) hover:text-(--text-primary)",
            )}
          >
            {r === "ALL" ? "All" : RESOURCE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-(--glass-border) bg-(--glass-bg) py-16">
          <ClipboardText weight="duotone" size={32} color="var(--text-muted)" />
          <p className="text-sm font-medium text-(--text-primary)">No entries found</p>
          <p className="text-xs text-(--text-muted)">Try adjusting your filters or search query.</p>
          <Button type="button" variant="outline" className="mt-1 rounded-lg" onClick={clearAll}>
            Clear filters
          </Button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-2 md:hidden">
            {rows.map((entry) => {
              const Icon = ACTION_META[entry.action].icon;
              return (
                <div key={entry.id} className="rounded-xl border border-(--glass-border) bg-(--glass-bg) p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge className={cn("rounded-full border px-2 py-0.5 text-[10px]", ACTION_META[entry.action].badgeClass)}>
                        <Icon weight="duotone" size={10} />
                        {entry.action}
                      </Badge>
                      <span className="text-xs text-(--text-muted)">{RESOURCE_LABELS[entry.resourceType]}</span>
                    </div>
                    <time className="text-[11px] text-(--text-muted)" title={entry.timestamp.toISOString()}>
                      {relativeTime(entry.timestamp)}
                    </time>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-medium text-(--text-primary)">{entry.resourceName}</p>
                  <p className="text-xs text-(--text-muted)">{entry.actorName} · {entry.divisionName}</p>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-md md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-(--glass-border) bg-[rgba(255,255,255,0.06)] !hover:bg-[rgba(255,255,255,0.06)]">
                  <TableHead className="w-[50px] text-center text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">#</TableHead>
                  <TableHead className="w-[100px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Time</TableHead>
                  <TableHead className="w-[100px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Action</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Resource</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Actor</TableHead>
                  <TableHead className="w-[90px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Division</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((entry, idx) => {
                  const Icon = ACTION_META[entry.action].icon;
                  return (
                    <TableRow
                      key={entry.id}
                      className={cn(
                        "border-b border-(--glass-border-subtle) transition-colors !hover:bg-(--glass-bg-hover)",
                        idx % 2 === 1 && "bg-[rgba(255,255,255,0.02)]",
                      )}
                    >
                      <TableCell className="py-3 text-center">
                        <span className="text-xs font-medium text-(--text-muted)">{rangeStart + idx}</span>
                      </TableCell>
                      <TableCell className="py-3">
                        <time
                          dateTime={entry.timestamp.toISOString()}
                          title={entry.timestamp.toISOString()}
                          className="whitespace-nowrap text-xs font-medium text-(--text-subtle)"
                        >
                          {relativeTime(entry.timestamp)}
                        </time>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge className={cn("rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide", ACTION_META[entry.action].badgeClass)}>
                          <Icon weight="duotone" size={12} />
                          {entry.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="truncate text-sm font-semibold text-(--text-primary)">{entry.resourceName}</span>
                          <span className="text-[11px] text-(--text-muted)">{RESOURCE_LABELS[entry.resourceType]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-(--text-primary)">{entry.actorName}</span>
                          <span className="text-[11px] text-(--text-muted)">{entry.actorEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-full border-transparent px-2.5 py-1 text-[10px] font-semibold",
                            DIVISION_BADGE[entry.divisionId] ?? "bg-[rgba(139,92,246,0.12)] text-(--accent-purple)",
                          )}
                        >
                          {entry.divisionName}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {entry.details?.oldValue && entry.details?.newValue ? (
                          <div className="flex flex-col gap-0.5 text-xs">
                            <span className="font-mono text-(--text-muted) line-through">{entry.details.oldValue}</span>
                            <span className="font-mono text-(--state-success)">{entry.details.newValue}</span>
                          </div>
                        ) : (
                          <span className="text-xs leading-relaxed text-(--text-subtle)">{entry.details?.changeDescription ?? "—"}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-xl border border-(--glass-border) bg-(--glass-bg) px-4 py-3 backdrop-blur-md">
            <span className="text-xs font-medium text-(--text-subtle)">
              Showing <span className="text-(--text-primary)">{rangeStart}–{rangeEnd}</span> of {total}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-(--glass-border) bg-transparent px-3 text-xs text-(--text-subtle)"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <CaretLeft weight="bold" size={14} />
                Prev
              </Button>
              <span className="min-w-[60px] text-center text-xs font-medium text-(--text-primary)">
                {safePage} / {pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-lg border-(--glass-border) bg-transparent px-3 text-xs text-(--text-subtle)"
                disabled={safePage >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <CaretRight weight="bold" size={14} />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}