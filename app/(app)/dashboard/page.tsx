import {
  Buildings,
  FolderLock,
  Key,
  ClipboardText,
  CaretRight,
  Eye,
  Plus,
  PencilSimple,
  Trash,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";

const stats = [
  {
    label: "My Divisions",
    value: "3",
    subtext: "QA, Dev, DevOps",
    icon: Buildings,
    iconBg: "rgba(77, 142, 255, 0.12)",
    iconColor: "var(--accent-primary)",
  },
  {
    label: "Total Projects",
    value: "12",
    subtext: "across all divisions",
    icon: FolderLock,
    iconBg: "rgba(45, 212, 191, 0.12)",
    iconColor: "var(--accent-teal)",
  },
  {
    label: "Credentials",
    value: "47",
    subtext: "stored & encrypted",
    icon: Key,
    iconBg: "rgba(245, 166, 35, 0.12)",
    iconColor: "var(--accent-amber)",
  },
  {
    label: "Audit Events",
    value: "128",
    subtext: "last 7 days",
    icon: ClipboardText,
    iconBg: "rgba(139, 92, 246, 0.12)",
    iconColor: "var(--accent-purple)",
  },
];

const mockDivisions = [
  {
    name: "QA Division",
    role: "Division Admin",
    accentColor: "var(--accent-primary)",
    accentBg: "rgba(77, 142, 255, 0.12)",
    projectCount: 5,
    memberCount: 6,
    credentialCount: 23,
  },
  {
    name: "Dev Division",
    role: "Member",
    accentColor: "var(--accent-teal)",
    accentBg: "rgba(45, 212, 191, 0.12)",
    projectCount: 4,
    memberCount: 8,
    credentialCount: 17,
  },
  {
    name: "DevOps",
    role: "Member",
    accentColor: "var(--accent-amber)",
    accentBg: "rgba(245, 166, 35, 0.12)",
    projectCount: 3,
    memberCount: 4,
    credentialCount: 7,
  },
];

const mockActivity = [
  {
    actor: "Budi S.",
    action: "viewed credential",
    target: "Staging API Key",
    division: "QA Division",
    timeAgo: "2 min ago",
    icon: Eye,
    iconBg: "rgba(77,142,255,0.10)",
    iconColor: "var(--accent-primary)",
  },
  {
    actor: "Rizky D.",
    action: "added credential",
    target: "DB_PASSWORD_STG",
    division: "QA Division",
    timeAgo: "1 hr ago",
    icon: Plus,
    iconBg: "rgba(18,183,106,0.10)",
    iconColor: "var(--state-success)",
  },
  {
    actor: "Ayu L.",
    action: "updated credential",
    target: "CLERK_SECRET_KEY",
    division: "Dev Division",
    timeAgo: "3 hr ago",
    icon: PencilSimple,
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  {
    actor: "Dimas R.",
    action: "joined division",
    target: "DevOps",
    division: "DevOps",
    timeAgo: "5 hr ago",
    icon: UsersThree,
    iconBg: "rgba(45,212,191,0.10)",
    iconColor: "var(--accent-teal)",
  },
  {
    actor: "Budi S.",
    action: "created project",
    target: "Mobile Staging",
    division: "QA Division",
    timeAgo: "Yesterday",
    icon: FolderLock,
    iconBg: "rgba(139,92,246,0.10)",
    iconColor: "var(--accent-purple)",
  },
  {
    actor: "Rizky D.",
    action: "deleted credential",
    target: "OLD_API_TOKEN",
    division: "Dev Division",
    timeAgo: "Yesterday",
    icon: Trash,
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
  {
    actor: "Ayu L.",
    action: "viewed credential",
    target: "SSH Deploy Key",
    division: "DevOps",
    timeAgo: "2 days ago",
    icon: Eye,
    iconBg: "rgba(77,142,255,0.10)",
    iconColor: "var(--accent-primary)",
  },
];

const quickAccess = [
  { projectName: "API Staging", division: "QA Division", credCount: 9 },
  { projectName: "API Production", division: "QA Division", credCount: 6 },
  { projectName: "Frontend Env", division: "Dev Division", credCount: 4 },
  { projectName: "CI/CD Secrets", division: "DevOps", credCount: 7 },
  { projectName: "Mobile Staging", division: "QA Division", credCount: 3 },
];

export default function DashboardPage() {
  return (
    <div>
      {/* Page title */}
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        Good morning, Rizky 👋
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Here&apos;s what&apos;s happening across your divisions today.
      </p>

      {/* Stat cards */}
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
                  <Icon
                    weight="duotone"
                    size={16}
                    color={stat.iconColor}
                  />
                </div>
              </div>
              <p
                className="text-3xl font-bold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {stat.subtext}
              </p>
            </div>
          );
        })}
      </div>

      {/* My Divisions section */}
      <div className="flex items-center justify-between mt-8 mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          My Divisions
        </h2>
        <button
          className="text-xs font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          View all
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockDivisions.map((div) => (
          <div
            key={div.name}
            className="glass rounded-xl p-5 flex flex-col gap-4 cursor-pointer hover:glass-raised transition-all duration-150"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: div.accentBg }}
              >
                <Buildings
                  weight="duotone"
                  size={18}
                  color={div.accentColor}
                />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {div.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {div.role}
                </p>
              </div>
              <CaretRight
                weight="duotone"
                size={14}
                color="var(--text-muted)"
                className="ml-auto"
              />
            </div>

            <div
              style={{ borderTop: "1px solid var(--glass-border-subtle)" }}
            />

            <div className="flex items-center gap-4">
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {div.projectCount}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Projects
                </p>
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {div.memberCount}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Members
                </p>
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {div.credentialCount}
                </p>
                <p
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  Credentials
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity */}
        <div className="glass rounded-xl p-5 lg:col-span-2">
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Recent Activity
          </h2>
          <div>
            {mockActivity.map((item, idx) => {
              const Icon = item.icon;
              const isLast = idx === mockActivity.length - 1;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 py-3"
                  style={
                    !isLast
                      ? { borderBottom: "1px solid var(--glass-border-subtle)" }
                      : undefined
                  }
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.iconBg }}
                  >
                    <Icon weight="duotone" size={14} color={item.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                      <span className="font-semibold">{item.actor}</span>{" "}
                      {item.action}{" "}
                      <span
                        className="font-medium"
                        style={{ color: "var(--accent-primary)" }}
                      >
                        {item.target}
                      </span>
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {item.division} · {item.timeAgo}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div className="glass rounded-xl p-5">
          <h2
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Quick Access
          </h2>
          <div>
            {quickAccess.map((proj, idx) => {
              const isLast = idx === quickAccess.length - 1;
              return (
                <div
                  key={proj.projectName}
                  className="flex items-center gap-3 py-2.5 cursor-pointer"
                  style={
                    !isLast
                      ? { borderBottom: "1px solid var(--glass-border-subtle)" }
                      : undefined
                  }
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: "var(--glass-bg-raised)" }}
                  >
                    <FolderLock
                      weight="duotone"
                      size={14}
                      color="var(--text-subtle)"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {proj.projectName}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {proj.division} · {proj.credCount} credentials
                    </p>
                  </div>
                  <CaretRight
                    weight="duotone"
                    size={12}
                    color="var(--text-muted)"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
