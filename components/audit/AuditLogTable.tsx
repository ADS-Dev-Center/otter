"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  CaretLeft,
  CaretRight,
  ClipboardText,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react/dist/ssr";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AuditLogRow } from "./AuditLogRow";
import { AuditLogSkeleton } from "./AuditLogSkeleton";
import type { AuditEntryDTO } from "@/app/api/audit/route";

type Division = { id: string; name: string };

type Props = {
  initialEntries: AuditEntryDTO[];
  initialTotal: number;
  initialPages: number;
  divisions: Division[];
};

type AuditActionFilter =
  | "ALL"
  | "CREDENTIAL_VIEW"
  | "CREDENTIAL_COPY"
  | "CREDENTIAL_CREATE"
  | "CREDENTIAL_UPDATE"
  | "CREDENTIAL_DELETE"
  | "PROJECT_CREATE"
  | "PROJECT_UPDATE"
  | "PROJECT_DELETE"
  | "MEMBER_INVITE"
  | "MEMBER_ROLE_CHANGE"
  | "MEMBER_REMOVE"
  | "DIVISION_CREATE"
  | "DIVISION_RENAME"
  | "DIVISION_DELETE";

type ResourceFilter = "ALL" | "CREDENTIAL" | "PROJECT" | "MEMBER" | "DIVISION";

const ACTION_PILLS: { value: AuditActionFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CREDENTIAL_VIEW", label: "View" },
  { value: "CREDENTIAL_CREATE", label: "Create" },
  { value: "CREDENTIAL_UPDATE", label: "Update" },
  { value: "CREDENTIAL_DELETE", label: "Delete" },
  { value: "CREDENTIAL_COPY", label: "Copy" },
];

const RESOURCE_PILLS: { value: ResourceFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "CREDENTIAL", label: "Credential" },
  { value: "PROJECT", label: "Project" },
  { value: "MEMBER", label: "Member" },
  { value: "DIVISION", label: "Division" },
];

export function AuditLogTable({
  initialEntries,
  initialTotal,
  initialPages,
  divisions,
}: Props) {
  const [entries, setEntries] = useState<AuditEntryDTO[]>(initialEntries);
  const [total, setTotal] = useState(initialTotal);
  const [pages, setPages] = useState(initialPages);

  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [division, setDivision] = useState("all");
  const [actionFilter, setActionFilter] = useState<AuditActionFilter>("ALL");
  const [resourceFilter, setResourceFilter] = useState<ResourceFilter>("ALL");
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [isPending, startTransition] = useTransition();

  const hasActiveFilters =
    search || dateRange !== "30d" || division !== "all" || actionFilter !== "ALL" || resourceFilter !== "ALL";

  const fetchData = useCallback(
    (opts: {
      search: string;
      dateRange: string;
      division: string;
      actionFilter: AuditActionFilter;
      resourceFilter: ResourceFilter;
      page: number;
    }) => {
      startTransition(async () => {
        const params = new URLSearchParams({
          dateRange: opts.dateRange,
          page: String(opts.page),
          perPage: String(perPage),
        });
        if (opts.division !== "all") params.set("divisionId", opts.division);
        if (opts.actionFilter !== "ALL") params.set("action", opts.actionFilter);
        if (opts.resourceFilter !== "ALL") params.set("resourceType", opts.resourceFilter);
        if (opts.search) params.set("q", opts.search);

        try {
          const res = await fetch(`/api/audit?${params.toString()}`);
          if (!res.ok) return;
          const json = await res.json();
          setEntries(json.data.entries);
          setTotal(json.data.total);
          setPages(json.data.pages);
        } catch {
          // silently ignore fetch errors
        }
      });
    },
    [],
  );

  useEffect(() => {
    fetchData({ search, dateRange, division, actionFilter, resourceFilter, page });
  }, [search, dateRange, division, actionFilter, resourceFilter, page, fetchData]);

  function clearAll() {
    setSearch("");
    setDateRange("30d");
    setDivision("all");
    setActionFilter("ALL");
    setResourceFilter("ALL");
    setPage(1);
  }

  const safePage = Math.min(page, Math.max(1, pages));
  const rangeStart = total === 0 ? 0 : (safePage - 1) * perPage + 1;
  const rangeEnd = Math.min(safePage * perPage, total);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(77,142,255,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <ClipboardText weight="duotone" size={22} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-(--text-primary)">Audit Log</h1>
            <p className="text-sm text-(--text-subtle)">
              Track all actions across credentials, projects, and members.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-(--text-primary)">
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

      {/* Toolbar */}
      <div className="glass flex flex-col gap-3 rounded-xl p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <MagnifyingGlass
            weight="duotone"
            size={16}
            color="var(--text-muted)"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by actor, resource, or action…"
            className="h-9 w-full rounded-lg border border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] pl-9 pr-3 text-sm text-(--text-primary) outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent-primary) focus:ring-1 focus:ring-[rgba(77,142,255,0.2)]"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={dateRange}
            onValueChange={(v) => {
              setDateRange(v);
              setPage(1);
            }}
          >
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

          <Select
            value={division}
            onValueChange={(v) => {
              setDivision(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] text-sm text-(--text-primary)">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-(--text-muted)">
          Action
        </span>
        {ACTION_PILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setActionFilter(value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              actionFilter === value
                ? "bg-(--accent-primary) text-white shadow-[0_0_8px_rgba(77,142,255,0.3)]"
                : "border border-(--glass-border) text-(--text-subtle) hover:border-[rgba(255,255,255,0.18)] hover:bg-(--glass-bg-hover) hover:text-(--text-primary)",
            )}
          >
            {label}
          </button>
        ))}

        <div className="mx-1 hidden h-5 w-px bg-(--glass-border) sm:block" />

        <span className="text-[11px] font-semibold uppercase tracking-widest text-(--text-muted)">
          Resource
        </span>
        {RESOURCE_PILLS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setResourceFilter(value);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
              resourceFilter === value
                ? "border border-(--accent-primary) bg-(--glass-bg-active) text-(--accent-primary) shadow-[0_0_8px_rgba(77,142,255,0.15)]"
                : "border border-(--glass-border) text-(--text-subtle) hover:border-[rgba(255,255,255,0.18)] hover:bg-(--glass-bg-hover) hover:text-(--text-primary)",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isPending ? (
        <AuditLogSkeleton />
      ) : total === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-xl py-16">
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
            {entries.map((entry) => (
              <div key={entry.id} className="glass rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-(--text-subtle)">{entry.action}</span>
                  <time className="text-[11px] text-(--text-muted)" title={entry.timestamp}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </time>
                </div>
                <p className="mt-1.5 truncate text-sm font-medium text-(--text-primary)">
                  {entry.resourceName}
                </p>
                <p className="text-xs text-(--text-muted)">
                  {entry.actorName} · {entry.divisionName ?? "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="glass hidden overflow-hidden rounded-xl md:block">
            <Table>
              <TableHeader className="glass-raised">
                <TableRow className="border-b border-(--glass-border)">
                  <TableHead className="w-[50px] text-center text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    #
                  </TableHead>
                  <TableHead className="w-[100px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Time
                  </TableHead>
                  <TableHead className="w-[130px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Action
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Resource
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Actor
                  </TableHead>
                  <TableHead className="w-[100px] text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Division
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-widest text-(--text-subtle)">
                    Details
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, idx) => (
                  <AuditLogRow
                    key={entry.id}
                    entry={entry}
                    rowNumber={rangeStart + idx}
                    isEven={idx % 2 === 1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="glass flex items-center justify-between rounded-xl px-4 py-3">
            <span className="text-xs font-medium text-(--text-subtle)">
              Showing{" "}
              <span className="text-(--text-primary)">
                {rangeStart}–{rangeEnd}
              </span>{" "}
              of {total}
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
