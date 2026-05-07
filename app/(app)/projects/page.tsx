import Link from "next/link";
import {
  FolderLock,
  Key,
  UsersThree,
  Plus,
  CaretRight,
  Buildings,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mockProjects } from "./mock-data";

const totalCredentials = mockProjects.reduce(
  (s, p) => s + p.credentialCount,
  0,
);
const totalMembers = [...new Set(mockProjects.map((p) => p.division))].length;

export default function ProjectsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <FolderLock
              weight="duotone"
              size={24}
              color="var(--accent-primary)"
            />
            <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
              Projects
            </h1>
          </div>
          <p className="text-sm mt-1 text-(--text-muted)">
            Manage your team's credential vaults across all divisions.
          </p>
        </div>

        <Button className="rounded-lg shrink-0">
          <Plus weight="duotone" data-icon="inline-start" />
          Create Project
        </Button>
      </div>

      {/* Summary strip */}
      <div className="glass rounded-xl flex items-center gap-6 px-5 py-3.5 mt-5">
        <div className="flex items-center gap-2">
          <FolderLock
            weight="duotone"
            size={16}
            color="var(--accent-primary)"
          />
          <span className="text-sm font-semibold text-(--text-primary)">
            {mockProjects.length}
          </span>
          <span className="text-sm text-(--text-muted)">Projects</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <Key weight="duotone" size={16} color="var(--accent-teal)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {totalCredentials}
          </span>
          <span className="text-sm text-(--text-muted)">Credentials</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <Buildings weight="duotone" size={16} color="var(--accent-amber)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {totalMembers}
          </span>
          <span className="text-sm text-(--text-muted)">Divisions</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mt-5">
        <MagnifyingGlass
          weight="duotone"
          size={14}
          color="var(--text-muted)"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <Input
          placeholder="Search projects..."
          className="pl-8 glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent"
        />
      </div>

      {/* Project cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
        {mockProjects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="glass rounded-xl flex flex-col overflow-hidden group transition-all duration-150 hover:glass-raised"
          >
            {/* Accent top bar */}
            <div
              className={cn(
                "h-0.5 w-full shrink-0",
                project.divisionAccentBarClass,
              )}
            />

            <div className="p-5 flex flex-col gap-4 flex-1">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-lg flex items-center justify-center shrink-0",
                      project.divisionIconBgClass,
                    )}
                  >
                    <FolderLock
                      weight="duotone"
                      size={20}
                      color={project.divisionIconColor}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-(--text-primary) leading-tight truncate">
                      {project.name}
                    </p>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          project.divisionBadgeClass,
                        )}
                      >
                        {project.division}
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
                {project.description}
              </p>

              <div className="h-px bg-(--glass-border-subtle)" />

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
                  <Key weight="duotone" size={14} color="var(--text-subtle)" />
                  <span className="text-base font-bold text-(--text-primary)">
                    {project.credentialCount}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                    Credentials
                  </span>
                </div>
                <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
                  <UsersThree
                    weight="duotone"
                    size={14}
                    color="var(--text-subtle)"
                  />
                  <span className="text-base font-bold text-(--text-primary)">
                    {project.memberCount}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
                    Members
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto">
                <span className="text-[11px] text-(--text-muted)">
                  Updated {project.lastUpdated}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-2.5 py-1 text-xs text-(--text-subtle) transition-colors group-hover:bg-(--glass-bg-hover) group-hover:text-(--text-primary)">
                  Open
                  <CaretRight weight="duotone" size={14} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
