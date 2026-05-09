"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FolderLock,
  Key,
  Buildings,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectListSkeleton } from "@/components/projects/ProjectListSkeleton";
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { EditProjectDialog } from "@/components/projects/EditProjectDialog";
import { DeleteProjectDialog } from "@/components/projects/DeleteProjectDialog";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  getDivisionPalette,
} from "@/lib/divisions";
import type { Project } from "@/types/project";

type Role = "SUPER_ADMIN" | "DIVISION_OWNER" | "DIVISION_ADMIN" | "MEMBER";

interface DivisionInfo {
  id: string;
  name: string;
  role: Role;
  memberCount: number;
}

function getDivisionBadgeClass(accentColor: string): string {
  const map: Record<string, string> = {
    "var(--accent-primary)":
      "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]",
    "var(--accent-teal)":
      "border-[rgba(45,212,191,0.3)] text-(--accent-teal) bg-[rgba(45,212,191,0.08)]",
    "var(--accent-amber)":
      "border-[rgba(245,166,35,0.3)] text-(--accent-amber) bg-[rgba(245,166,35,0.08)]",
  };
  return map[accentColor] ?? map["var(--accent-primary)"]!;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeDivisionId, setActiveDivisionId] = useState<string>("");
  const [divisions, setDivisions] = useState<DivisionInfo[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const activeDivision = useMemo(() => {
    return (
      divisions.find((d) => d.id === activeDivisionId) ?? divisions[0] ?? null
    );
  }, [divisions, activeDivisionId]);

  const fetchProjects = useCallback(async (divisionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = divisionId
        ? `/api/projects?divisionId=${divisionId}`
        : "/api/projects";
      const res = await fetch(url);
      if (!res.ok) {
        const status = res.status;
        const text = await res.text().catch(() => "");
        throw new Error(
          `HTTP ${status}: ${text || "Failed to fetch projects"}`,
        );
      }
      const json = (await res.json()) as { data: Project[] };
      setProjects(json.data ?? []);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch projects";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedId =
      typeof window !== "undefined"
        ? (window.localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY) ?? "")
        : "";
    setActiveDivisionId(storedId);
    fetchProjects(storedId);

    async function loadDivisions() {
      const res = await fetch("/api/divisions");
      if (!res.ok) return;
      const json = (await res.json()) as { data: DivisionInfo[] };
      setDivisions(json.data ?? []);
    }
    loadDivisions();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeDivision && !activeDivisionId) {
      setActiveDivisionId(activeDivision.id);
    }
  }, [activeDivision, activeDivisionId]);

  useEffect(() => {
    function onDivisionChange() {
      const id =
        typeof window !== "undefined"
          ? (window.localStorage.getItem(ACTIVE_DIVISION_STORAGE_KEY) ?? "")
          : "";
      setActiveDivisionId(id);
      fetchProjects(id);
    }
    window.addEventListener("otter-division-context-change", onDivisionChange);
    return () =>
      window.removeEventListener(
        "otter-division-context-change",
        onDivisionChange,
      );
  }, [fetchProjects]);

  const role = activeDivision?.role ?? null;
  const canCreate =
    role === "DIVISION_OWNER" ||
    role === "DIVISION_ADMIN" ||
    role === "SUPER_ADMIN";
  const canEdit =
    role === "DIVISION_OWNER" ||
    role === "DIVISION_ADMIN" ||
    role === "SUPER_ADMIN";
  const canDelete = role === "DIVISION_OWNER" || role === "SUPER_ADMIN";

  const filtered = search
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()),
      )
    : projects;

  function getPaletteForProject(project: Project) {
    const divIdx = divisions.findIndex((d) => d.id === project.divisionId);
    const palette = getDivisionPalette(divIdx === -1 ? 0 : divIdx);
    const divisionName =
      divisions.find((d) => d.id === project.divisionId)?.name ?? "Division";
    const memberCount =
      divisions.find((d) => d.id === project.divisionId)?.memberCount ?? 1;
    return {
      iconBgClass: palette.iconBgClass,
      iconColor: palette.iconColor,
      badgeClass: getDivisionBadgeClass(palette.iconColor),
      divisionName,
      memberCount,
    };
  }

  return (
    <div>
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
            Manage your team&apos;s credential vaults across all divisions.
          </p>
        </div>

        {canCreate && (
          <Button
            className="rounded-lg shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus weight="duotone" data-icon="inline-start" />
            Create Project
          </Button>
        )}
      </div>

      <div className="glass rounded-xl flex items-center gap-6 px-5 py-3.5 mt-5">
        <div className="flex items-center gap-2">
          <FolderLock
            weight="duotone"
            size={16}
            color="var(--accent-primary)"
          />
          <span className="text-sm font-semibold text-(--text-primary)">
            {projects.length}
          </span>
          <span className="text-sm text-(--text-muted)">Projects</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <Key weight="duotone" size={16} color="var(--accent-teal)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {projects.reduce((sum, p) => sum + p._count.credentials, 0)}
          </span>
          <span className="text-sm text-(--text-muted)">Credentials</span>
        </div>

        <div className="w-px h-4 bg-(--glass-border)" />

        <div className="flex items-center gap-2">
          <Buildings weight="duotone" size={16} color="var(--accent-amber)" />
          <span className="text-sm font-semibold text-(--text-primary)">
            {divisions.length}
          </span>
          <span className="text-sm text-(--text-muted)">Divisions</span>
        </div>
      </div>

      <div className="relative mt-5">
        <MagnifyingGlass
          weight="duotone"
          size={14}
          color="var(--text-muted)"
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent"
        />
      </div>

      {error && (
        <div className="glass rounded-xl mt-5 border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-sm text-(--state-error)">
          <p className="font-medium">Failed to load projects</p>
          <p className="text-xs text-(--text-muted) mt-1">{error}</p>
        </div>
      )}

      {loading ? (
        <ProjectListSkeleton />
      ) : error ? null : filtered.length === 0 ? (
        <div className="glass rounded-xl mt-5 w-full flex flex-col items-center justify-center gap-5 py-20 text-center">
          <div className="glass rounded-full size-16 flex items-center justify-center">
            <FolderLock weight="duotone" size={32} color="var(--text-muted)" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-(--text-primary)">
              {search ? "No projects match your search" : "No projects yet"}
            </p>
            <p className="text-xs text-(--text-muted)">
              {search
                ? "Try a different search term"
                : canCreate
                  ? "Create your first project to get started"
                  : "No projects have been created in this division yet"}
            </p>
          </div>
          {!search && canCreate && (
            <Button className="rounded-lg" onClick={() => setCreateOpen(true)}>
              <Plus weight="duotone" size={16} />
              Create Project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              palette={getPaletteForProject(project)}
              canEdit={canEdit}
              canDelete={canDelete}
              onEdit={setEditProject}
              onDelete={setDeleteProject}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        divisionId={activeDivision?.id ?? activeDivisionId}
        onOpenChange={setCreateOpen}
        onCreated={(project) => setProjects((prev) => [project, ...prev])}
      />

      <EditProjectDialog
        open={editProject !== null}
        project={editProject}
        onOpenChange={(open) => {
          if (!open) setEditProject(null);
        }}
        onUpdated={(updated) => {
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
          setEditProject(null);
        }}
      />

      <DeleteProjectDialog
        open={deleteProject !== null}
        project={deleteProject}
        onOpenChange={(open) => {
          if (!open) setDeleteProject(null);
        }}
        onDeleted={(id) => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
          setDeleteProject(null);
        }}
      />
    </div>
  );
}
