import { Buildings, ClipboardText, FolderLock, Key } from "@phosphor-icons/react/dist/ssr";

type Props = {
  divisionCount: number;
  projectCount: number;
  credentialCount: number;
  auditCount: number;
  divisionNames: string[];
};

export function DashboardStats({
  divisionCount,
  projectCount,
  credentialCount,
  auditCount,
  divisionNames,
}: Props) {
  const divisionSubtext =
    divisionNames.length > 0 ? divisionNames.slice(0, 3).join(", ") : "no divisions yet";

  const stats = [
    {
      label: "My Divisions",
      value: divisionCount,
      subtext: divisionSubtext,
      icon: Buildings,
      iconBg: "rgba(77, 142, 255, 0.12)",
      iconColor: "var(--accent-primary)",
    },
    {
      label: "Total Projects",
      value: projectCount,
      subtext: "across all divisions",
      icon: FolderLock,
      iconBg: "rgba(45, 212, 191, 0.12)",
      iconColor: "var(--accent-teal)",
    },
    {
      label: "Credentials",
      value: credentialCount,
      subtext: "stored & encrypted",
      icon: Key,
      iconBg: "rgba(245, 166, 35, 0.12)",
      iconColor: "var(--accent-amber)",
    },
    {
      label: "Audit Events",
      value: auditCount,
      subtext: "last 7 days",
      icon: ClipboardText,
      iconBg: "rgba(139, 92, 246, 0.12)",
      iconColor: "var(--accent-purple)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="glass rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: stat.iconBg }}
              >
                <Icon weight="duotone" size={16} color={stat.iconColor} />
              </div>
            </div>
            <p
              className="text-3xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </p>
            <p className="text-xs mt-1 truncate" style={{ color: "var(--text-muted)" }}>
              {stat.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
