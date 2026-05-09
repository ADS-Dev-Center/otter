import { ACTION_META, relativeTime } from "@/lib/audit-meta";
import type { AuditAction } from "@/app/generated/prisma/enums";

export type ActivityEntry = {
  id: string;
  action: AuditAction;
  resourceName: string;
  divisionName: string | null;
  actorName: string;
  actorImageUrl: string | null;
  timestamp: Date;
};

type Props = { entries: ActivityEntry[] };

export function RecentActivity({ entries }: Props) {
  return (
    <div className="glass rounded-xl p-5 lg:col-span-2">
      <h2
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Recent Activity
      </h2>

      {entries.length === 0 ? (
        <p className="text-sm py-4 text-center" style={{ color: "var(--text-muted)" }}>
          No activity yet.
        </p>
      ) : (
        <div>
          {entries.map((entry, idx) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta.icon;
            const isLast = idx === entries.length - 1;

            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 py-3"
                style={
                  !isLast
                    ? { borderBottom: "1px solid var(--glass-border-subtle)" }
                    : undefined
                }
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: meta.iconBg }}
                >
                  <Icon weight="duotone" size={14} color={meta.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    <span className="font-semibold">{entry.actorName}</span>{" "}
                    {meta.verb}{" "}
                    <span
                      className="font-medium"
                      style={{ color: "var(--accent-primary)" }}
                    >
                      {entry.resourceName}
                    </span>
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {entry.divisionName ?? "—"} · {relativeTime(entry.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
