import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AuditEntryDTO } from "@/app/api/audit/route";
import {
  ACTION_META,
  formatAuditResourceName,
  relativeTime,
} from "@/lib/audit-meta";

const RESOURCE_LABELS: Record<string, string> = {
  CREDENTIAL: "Credential",
  PROJECT: "Project",
  MEMBER: "Member",
  DIVISION: "Division",
};

type Props = { entry: AuditEntryDTO; rowNumber: number; isEven: boolean };

export function AuditLogRow({ entry, rowNumber, isEven }: Props) {
  const meta = ACTION_META[entry.action];
  const Icon = meta.icon;
  const resourceLabel = formatAuditResourceName(
    entry.action,
    entry.resourceName,
  );

  return (
    <TableRow
      className={cn(
        "border-b border-(--glass-border-subtle) transition-colors hover:bg-(--glass-bg-hover)",
        isEven && "bg-[rgba(255,255,255,0.02)]",
      )}
    >
      <TableCell className="py-3 text-center">
        <span className="text-xs font-medium text-(--text-muted)">
          {rowNumber}
        </span>
      </TableCell>

      <TableCell className="py-3">
        <time
          dateTime={entry.timestamp}
          title={entry.timestamp}
          className="whitespace-nowrap text-xs font-medium text-(--text-subtle)"
        >
          {relativeTime(entry.timestamp)}
        </time>
      </TableCell>

      <TableCell className="py-3">
        <Badge
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wide",
            meta.badgeClass,
          )}
        >
          <Icon weight="duotone" size={12} />
          {meta.label}
        </Badge>
      </TableCell>

      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-(--text-primary)">
            {resourceLabel}
          </span>
          <span className="text-[11px] text-(--text-muted)">
            {RESOURCE_LABELS[entry.resourceType] ?? entry.resourceType}
          </span>
        </div>
      </TableCell>

      <TableCell className="py-3">
        <div className="flex items-center gap-2.5">
          {entry.actorImageUrl ? (
            <img
              src={entry.actorImageUrl}
              alt={entry.actorName}
              className="size-7 rounded-full border border-(--glass-border)"
            />
          ) : (
            <div className="flex size-7 items-center justify-center rounded-full border border-(--glass-border) bg-(--glass-bg-hover) text-[10px] font-bold text-(--text-subtle)">
              {entry.actorName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-(--text-primary)">
              {entry.actorName}
            </span>
            <span className="text-[11px] text-(--text-muted)">
              {entry.actorEmail}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell className="py-3">
        {entry.divisionName ? (
          <Badge
            variant="outline"
            className="rounded-full border-transparent bg-[rgba(77,142,255,0.1)] px-2.5 py-1 text-[10px] font-semibold text-(--accent-primary)"
          >
            {entry.divisionName}
          </Badge>
        ) : (
          <span className="text-xs text-(--text-muted)">—</span>
        )}
      </TableCell>

      <TableCell className="py-3">
        {entry.metadata?.oldValue && entry.metadata?.newValue ? (
          <div className="flex flex-col gap-0.5 text-xs">
            <span className="font-mono text-(--text-muted) line-through">
              {entry.metadata.oldValue}
            </span>
            <span className="font-mono text-(--state-success)">
              {entry.metadata.newValue}
            </span>
          </div>
        ) : (
          <span className="text-xs leading-relaxed text-(--text-subtle)">
            {entry.metadata?.changeDescription ?? "—"}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
