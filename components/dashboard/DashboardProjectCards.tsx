import Link from "next/link";
import { FolderLock, Key } from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DashboardProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  credentialCount: number;
  divisionName: string;
  iconBgClass: string;
  iconColor: string;
  badgeClass: string;
  updatedAt: Date;
};

type Props = { projects: DashboardProject[] };

export function DashboardProjectCards({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div
        className="glass rounded-xl p-8 text-center"
        style={{ color: "var(--text-muted)" }}
      >
        <p className="text-sm">No projects yet.</p>
        <Link
          href="/projects"
          className="text-xs mt-2 inline-block"
          style={{ color: "var(--accent-primary)" }}
        >
          Create one →
        </Link>
      </div>
    );
  }

  const gridCols =
    projects.length === 1
      ? "grid-cols-1"
      : projects.length === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-4", gridCols)}>
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.slug}`}
          className="glass rounded-xl flex flex-col overflow-hidden group transition-all duration-150 hover:glass-raised"
        >
          <div className="p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "size-10 rounded-lg flex items-center justify-center shrink-0",
                  project.iconBgClass,
                )}
              >
                <FolderLock weight="duotone" size={20} color={project.iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-(--text-primary) leading-tight truncate">
                  {project.name}
                </p>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] px-1.5 py-0", project.badgeClass)}
                  >
                    {project.divisionName}
                  </Badge>
                </div>
              </div>
            </div>

            {project.description && (
              <p className="text-xs text-(--text-muted) leading-relaxed line-clamp-2">
                {project.description}
              </p>
            )}

            <div className="h-px bg-(--glass-border-subtle)" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Key weight="duotone" size={13} color="var(--text-subtle)" />
                <span className="text-sm font-bold text-(--text-primary)">
                  {project.credentialCount}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                  Credentials
                </span>
              </div>
              <span className="text-[11px] text-(--text-muted)">
                {new Date(project.updatedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
