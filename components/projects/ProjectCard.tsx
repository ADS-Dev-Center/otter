"use client";

import Link from "next/link";
import {
  FolderLock,
  Key,
  UsersThree,
  CaretRight,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface DivisionPalette {
  accentBarClass: string;
  iconBgClass: string;
  iconColor: string;
  badgeClass: string;
  divisionName: string;
  memberCount: number;
}

interface ProjectCardProps {
  project: Project;
  palette: DivisionPalette;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({
  project,
  palette,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const showMenu = canEdit || canDelete;

  return (
    <div className="glass rounded-xl flex flex-col overflow-hidden group relative">
      <div className={cn("h-0.5 w-full shrink-0", palette.accentBarClass)} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/projects/${project.id}`}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0",
                palette.iconBgClass,
              )}
            >
              <FolderLock
                weight="duotone"
                size={20}
                color={palette.iconColor}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-(--text-primary) leading-tight truncate">
                {project.name}
              </p>
              <div className="mt-1">
                <Badge
                  variant="outline"
                  className={cn("text-[10px] px-1.5 py-0", palette.badgeClass)}
                >
                  {palette.divisionName}
                </Badge>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 shrink-0 mt-0.5">
            {showMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    onClick={(e) => e.preventDefault()}
                  >
                    <DotsThreeVertical weight="duotone" size={16} color="var(--text-muted)" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="panel-dropdown w-36">
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit(project);
                      }}
                      className="text-(--text-primary) focus:bg-(--glass-bg-hover) cursor-pointer"
                    >
                      Rename
                    </DropdownMenuItem>
                  )}
                  {canDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete(project);
                      }}
                      className="text-(--state-error) focus:bg-[rgba(240,68,56,0.12)] focus:text-(--state-error) cursor-pointer"
                    >
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Link href={`/projects/${project.id}`}>
              <CaretRight
                weight="duotone"
                size={16}
                color="var(--text-muted)"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
              />
            </Link>
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-(--text-muted) leading-relaxed">
            {project.description}
          </p>
        )}

        <div className="h-px bg-(--glass-border-subtle)" />

        <div className="grid grid-cols-2 gap-2">
          <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
            <Key weight="duotone" size={14} color="var(--text-subtle)" />
            <span className="text-base font-bold text-(--text-primary)">{project._count.credentials}</span>
            <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
              Credentials
            </span>
          </div>
          <div className="glass rounded-lg flex flex-col items-center gap-0.5 py-2.5">
            <UsersThree weight="duotone" size={14} color="var(--text-subtle)" />
            <span className="text-base font-bold text-(--text-primary)">{palette.memberCount}</span>
            <span className="text-[10px] uppercase tracking-wider text-(--text-muted)">
              Members
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-[11px] text-(--text-muted)">
            {new Date(project.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-2.5 py-1 text-xs text-(--text-subtle) transition-colors group-hover:bg-(--glass-bg-hover) group-hover:text-(--text-primary)"
          >
            Open
            <CaretRight weight="duotone" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
