import {
  Buildings,
  FolderLock,
  UsersThree,
  Key,
  Plus,
  CaretRight,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DivisionRole = "Division Owner" | "Division Admin" | "Member";

interface MockMember {
  initials: string;
  gradientFrom: string;
  gradientTo: string;
}

interface MockDivision {
  id: string;
  name: string;
  description: string;
  role: DivisionRole;
  iconBgClass: string;
  iconColor: string;
  accentBarClass: string;
  projectCount: number;
  memberCount: number;
  credentialCount: number;
  members: MockMember[];
}

const mockDivisions: MockDivision[] = [
  {
    id: "qa",
    name: "QA Division",
    description: "Quality assurance and testing team workspace.",
    role: "Division Admin",
    iconBgClass: "bg-[rgba(77,142,255,0.12)]",
    iconColor: "var(--accent-primary)",
    accentBarClass: "bg-(--accent-primary)",
    projectCount: 5,
    memberCount: 6,
    credentialCount: 23,
    members: [
      { initials: "BS", gradientFrom: "from-(--accent-primary)", gradientTo: "to-(--accent-teal)" },
      { initials: "RD", gradientFrom: "from-(--accent-teal)", gradientTo: "to-(--accent-purple)" },
      { initials: "AL", gradientFrom: "from-(--accent-amber)", gradientTo: "to-(--accent-primary)" },
      { initials: "DR", gradientFrom: "from-(--accent-purple)", gradientTo: "to-(--accent-primary)" },
    ],
  },
  {
    id: "dev",
    name: "Dev Division",
    description: "Software development and engineering workspace.",
    role: "Member",
    iconBgClass: "bg-[rgba(45,212,191,0.12)]",
    iconColor: "var(--accent-teal)",
    accentBarClass: "bg-(--accent-teal)",
    projectCount: 4,
    memberCount: 8,
    credentialCount: 17,
    members: [
      { initials: "JK", gradientFrom: "from-(--accent-teal)", gradientTo: "to-(--accent-primary)" },
      { initials: "PR", gradientFrom: "from-(--accent-purple)", gradientTo: "to-(--accent-teal)" },
      { initials: "SN", gradientFrom: "from-(--accent-primary)", gradientTo: "to-(--accent-amber)" },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    description: "Infrastructure, CI/CD and deployment workspace.",
    role: "Member",
    iconBgClass: "bg-[rgba(245,166,35,0.12)]",
    iconColor: "var(--accent-amber)",
    accentBarClass: "bg-(--accent-amber)",
    projectCount: 3,
    memberCount: 4,
    credentialCount: 7,
    members: [
      { initials: "DW", gradientFrom: "from-(--accent-amber)", gradientTo: "to-(--accent-teal)" },
      { initials: "FK", gradientFrom: "from-(--accent-primary)", gradientTo: "to-(--accent-purple)" },
    ],
  },
];

function roleBadgeVariant(role: DivisionRole) {
  if (role === "Division Owner") return "default" as const;
  if (role === "Division Admin") return "secondary" as const;
  return "outline" as const;
}

export default function DivisionsPage() {
  const totalMembers = mockDivisions.reduce((sum, d) => sum + d.memberCount, 0);
  const totalProjects = mockDivisions.reduce((sum, d) => sum + d.projectCount, 0);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <Buildings weight="duotone" size={24} color="var(--accent-primary)" />
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Divisions
            </h1>
          </div>
          <p className="text-sm mt-1 text-(--text-muted)">
            Isolated workspaces for your teams and departments.
          </p>
        </div>

        <Button className="rounded-lg shrink-0">
          <Plus data-icon="inline-start" weight="duotone" />
          Create Division
        </Button>
      </div>

      {/* Summary strip */}
      <div className="glass rounded-xl flex items-center gap-6 px-5 py-3.5 mt-5">
        <div className="flex items-center gap-2">
          <Buildings weight="duotone" size={16} color="var(--accent-primary)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {mockDivisions.length}
          </span>
          <span className="text-sm text-(--text-muted)">Divisions</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <UsersThree weight="duotone" size={16} color="var(--accent-teal)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {totalMembers}
          </span>
          <span className="text-sm text-(--text-muted)">Members</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <FolderLock weight="duotone" size={16} color="var(--accent-amber)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {totalProjects}
          </span>
          <span className="text-sm text-(--text-muted)">Projects</span>
        </div>
      </div>

      {/* Division cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {mockDivisions.map((div) => (
          <div
            key={div.id}
            className="glass rounded-xl flex flex-col overflow-hidden cursor-pointer group transition-all duration-150 hover:glass-raised"
          >
            {/* Top accent bar */}
            <div className={cn("h-0.5 w-full shrink-0", div.accentBarClass)} />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* Division header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-lg flex items-center justify-center shrink-0",
                      div.iconBgClass
                    )}
                  >
                    <Buildings weight="duotone" size={20} color={div.iconColor} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-(--text-primary) leading-tight truncate">
                      {div.name}
                    </p>
                    <div className="mt-1">
                      <Badge variant={roleBadgeVariant(div.role)}>
                        {div.role}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CaretRight
                  weight="duotone"
                  size={16}
                  color="var(--text-muted)"
                  className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                />
              </div>

              <p className="text-xs text-(--text-muted) leading-relaxed">
                {div.description}
              </p>

              {/* Divider */}
              <div className="h-px bg-(--glass-border-subtle)" />

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
                  <FolderLock weight="duotone" size={14} color="var(--text-subtle)" />
                  <span className="text-base font-bold text-(--text-primary)">
                    {div.projectCount}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                    Projects
                  </span>
                </div>
                <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
                  <UsersThree weight="duotone" size={14} color="var(--text-subtle)" />
                  <span className="text-base font-bold text-(--text-primary)">
                    {div.memberCount}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                    Members
                  </span>
                </div>
                <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
                  <Key weight="duotone" size={14} color="var(--text-subtle)" />
                  <span className="text-base font-bold text-(--text-primary)">
                    {div.credentialCount}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                    Credentials
                  </span>
                </div>
              </div>

              {/* Footer: member avatars + enter button */}
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center -space-x-1.5">
                  {div.members.slice(0, 4).map((member, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "size-6 rounded-full flex items-center justify-center",
                        "text-[9px] font-bold text-white bg-gradient-to-br shrink-0",
                        "ring-1 ring-(--glass-border)",
                        member.gradientFrom,
                        member.gradientTo
                      )}
                    >
                      {member.initials}
                    </div>
                  ))}
                  {div.memberCount > 4 && (
                    <div className="size-6 rounded-full flex items-center justify-center text-[9px] font-semibold glass shrink-0 ring-1 ring-(--glass-border) text-(--text-muted)">
                      +{div.memberCount - 4}
                    </div>
                  )}
                </div>

                <Button variant="ghost" size="sm" className="rounded-lg text-xs">
                  Enter
                  <CaretRight data-icon="inline-end" weight="duotone" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
