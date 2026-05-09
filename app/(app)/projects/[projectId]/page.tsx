import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeft,
  FolderLock,
  Key,
  UsersThree,
  CalendarBlank,
  Plus,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { getDivisionPalette } from "@/lib/divisions";
import { ProjectCredentialsList } from "@/components/projects/ProjectCredentialsList";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      division: {
        include: { _count: { select: { memberships: true } } },
      },
      credentials: {
        include: {
          fields: { select: { id: true, key: true, secret: true, credentialId: true } },
          project: { select: { id: true, name: true, divisionId: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) notFound();

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(project.divisionId)) notFound();

  const role = await getUserRoleInDivision(userId, project.divisionId);

  const divisionIndex = divisionIds.indexOf(project.divisionId);
  const palette = getDivisionPalette(divisionIndex === -1 ? 0 : divisionIndex);

  const badgeClass =
    palette.accentColor === "teal"
      ? "border-[rgba(45,212,191,0.3)] text-(--accent-teal) bg-[rgba(45,212,191,0.08)]"
      : palette.accentColor === "amber"
        ? "border-[rgba(245,166,35,0.3)] text-(--accent-amber) bg-[rgba(245,166,35,0.08)]"
        : "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]";

  const canEdit =
    role === "DIVISION_OWNER" || role === "DIVISION_ADMIN" || role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button asChild variant="ghost" className="rounded-lg px-2 text-xs">
            <Link href="/projects">
              <ArrowLeft weight="duotone" size={14} />
              Back to projects
            </Link>
          </Button>

          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-xl",
                palette.iconBgClass,
              )}
            >
              <FolderLock weight="duotone" size={22} color={palette.iconColor} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-1 text-sm text-(--text-muted)">{project.description}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", badgeClass)}
            >
              {project.division.name}
            </Badge>
            <Badge
              variant="outline"
              className="border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] text-(--text-subtle)"
            >
              {project.environment}
            </Badge>
          </div>
        </div>

        {canEdit && (
          <Button asChild className="rounded-lg bg-(--button-liquid-bg) hover:bg-(--button-liquid-bg-hover) border border-(--button-liquid-border) text-(--text-primary)">
            <Link href={`/projects/${projectId}/credentials/new`}>
              <Plus weight="duotone" size={14} className="mr-1.5" />
              Add credential
            </Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <Key weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">Credentials</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-(--text-primary)">
            {project.credentials.length}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <UsersThree weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">Members</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-(--text-primary)">
            {project.division._count.memberships}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <CalendarBlank weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">Updated</span>
          </div>
          <p className="mt-3 text-xl font-bold text-(--text-primary)">
            {new Date(project.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-(--glass-border-subtle) px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-(--text-primary)">
              Project Credentials
            </h2>
            <p className="text-sm text-(--text-muted)">
              Credentials belong to this project and are masked by default.
            </p>
          </div>
          <Badge
            variant="outline"
            className="border-[rgba(77,142,255,0.30)] bg-[rgba(77,142,255,0.08)] text-(--accent-primary)"
          >
            Project-scoped
          </Badge>
        </div>

        <ProjectCredentialsList
          projectId={projectId}
          initialCredentials={project.credentials}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
