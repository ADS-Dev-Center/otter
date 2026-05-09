import { Buildings, CaretRight } from "@phosphor-icons/react/dist/ssr";

const ROLE_LABEL: Record<string, string> = {
  DIVISION_OWNER: "Owner",
  DIVISION_ADMIN: "Admin",
  MEMBER: "Member",
  SUPER_ADMIN: "Super Admin",
};

export type DashboardDivision = {
  id: string;
  name: string;
  role: string;
  projectCount: number;
  memberCount: number;
  credentialCount: number;
  iconColor: string;
  iconBg: string;
};

type Props = { divisions: DashboardDivision[] };

export function DivisionCards({ divisions }: Props) {
  if (divisions.length === 0) {
    return (
      <div
        className="glass rounded-xl p-8 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        <p className="text-sm">No divisions yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {divisions.map((div) => (
        <div
          key={div.id}
          className="glass rounded-xl p-5 flex flex-col gap-4 transition-all duration-150"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: div.iconBg }}
            >
              <Buildings weight="duotone" size={18} color={div.iconColor} />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {div.name}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {ROLE_LABEL[div.role] ?? div.role}
              </p>
            </div>
            <CaretRight
              weight="duotone"
              size={14}
              color="var(--text-muted)"
              className="ml-auto"
            />
          </div>

          <div style={{ borderTop: "1px solid var(--glass-border-subtle)" }} />

          <div className="flex items-center gap-4">
            {[
              { value: div.projectCount, label: "Projects" },
              { value: div.memberCount, label: "Members" },
              { value: div.credentialCount, label: "Credentials" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {value}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
