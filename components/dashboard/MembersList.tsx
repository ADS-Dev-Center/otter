export type DashboardMember = {
  id: string;
  clerkId: string;
  name: string;
  email?: string;
  imageUrl: string | null;
  role: string;
  divisionName: string;
};

type RoleConfig = {
  label: string;
  color: string;
  ring: string;
  avatarBg: string;
};

const ROLE_CONFIG: Record<string, RoleConfig> = {
  DIVISION_OWNER: {
    label: "Owner",
    color: "var(--accent-purple)",
    ring: "ring-[rgba(139,92,246,0.6)]",
    avatarBg:
      "linear-gradient(135deg, rgba(139,92,246,0.9), rgba(77,142,255,0.75))",
  },
  DIVISION_ADMIN: {
    label: "Admin",
    color: "var(--accent-primary)",
    ring: "ring-[rgba(77,142,255,0.6)]",
    avatarBg:
      "linear-gradient(135deg, rgba(77,142,255,0.9), rgba(45,212,191,0.75))",
  },
  MEMBER: {
    label: "Member",
    color: "var(--text-subtle)",
    ring: "ring-[rgba(154,170,196,0.35)]",
    avatarBg:
      "linear-gradient(135deg, rgba(154,170,196,0.5), rgba(77,142,255,0.35))",
  },
  SUPER_ADMIN: {
    label: "Super Admin",
    color: "var(--accent-amber)",
    ring: "ring-[rgba(245,166,35,0.6)]",
    avatarBg:
      "linear-gradient(135deg, rgba(245,166,35,0.9), rgba(77,142,255,0.65))",
  },
};

const FALLBACK_CONFIG: RoleConfig = ROLE_CONFIG.MEMBER!;

type Props = { members: DashboardMember[] };

export function MembersList({ members }: Props) {
  return (
    <div className="glass rounded-xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Members
        </h2>
        {members.length > 0 && (
          <span
            className="text-xs font-medium tabular-nums"
            style={{ color: "var(--text-muted)" }}
          >
            {members.length}
          </span>
        )}
      </div>

      {members.length === 0 ? (
        <p
          className="text-sm py-6 text-center"
          style={{ color: "var(--text-muted)" }}
        >
          No members yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {members.map((member) => {
            const cfg = ROLE_CONFIG[member.role] ?? FALLBACK_CONFIG;
            const initials =
              member.name
                .split(" ")
                .map((w) => w[0] ?? "")
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?";

            return (
              <div
                key={member.id}
                className="glass-raised rounded-xl p-3 flex items-center gap-3"
              >
                {/* Avatar */}
                {member.imageUrl ? (
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className={`size-10 rounded-full object-cover shrink-0 ring-2 ring-offset-1 ring-offset-transparent ${cfg.ring}`}
                  />
                ) : (
                  <div
                    className={`size-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white ring-2 ring-offset-1 ring-offset-transparent ${cfg.ring}`}
                    style={{ background: cfg.avatarBg }}
                  >
                    {initials}
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-semibold leading-tight truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {member.name}
                  </p>
                  <p
                    className="text-[11px] truncate mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {member.email || member.divisionName}
                  </p>
                </div>

                {/* Role */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: cfg.color }}
                  />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
