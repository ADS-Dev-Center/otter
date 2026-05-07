import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Eye,
  FolderLock,
  Key,
  UsersThree,
  CalendarBlank,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  credentialTypeConfig,
  getProjectById,
  getProjectCredentials,
} from "../mock-data";
import { ProjectCredentialsAccordion } from "@/components/projects/ProjectCredentialsAccordion";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  if (!project) {
    notFound();
  }

  const credentials = getProjectCredentials(project.id);
  const environmentOrder = [
    "production",
    "development",
    "staging",
    "shared",
  ] as const;
  const groupedCredentials = environmentOrder
    .map((environment) => ({
      environment,
      items: credentials.filter(
        (credential) => credential.environment === environment,
      ),
    }))
    .filter((group) => group.items.length > 0);

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
                project.divisionIconBgClass,
              )}
            >
              <FolderLock
                weight="duotone"
                size={22}
                color={project.divisionIconColor}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
                {project.name}
              </h1>
              <p className="mt-1 text-sm text-(--text-muted)">
                {project.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                project.divisionBadgeClass,
              )}
            >
              {project.division}
            </Badge>
            <Badge
              variant="outline"
              className="border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] text-(--text-subtle)"
            >
              {project.status}
            </Badge>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="rounded-lg">
            <Key weight="duotone" size={14} />
            Add Credential
          </Button>
          <Button variant="ghost" className="rounded-lg">
            <Eye weight="duotone" size={14} />
            Reveal preview
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <Key weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">
              Credentials
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-(--text-primary)">
            {project.credentialCount}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <UsersThree weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">Members</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-(--text-primary)">
            {project.memberCount}
          </p>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 text-(--text-muted)">
            <CalendarBlank weight="duotone" size={16} />
            <span className="text-xs uppercase tracking-[0.18em]">Updated</span>
          </div>
          <p className="mt-3 text-3xl font-bold text-(--text-primary)">
            {project.lastUpdated}
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

        <ProjectCredentialsAccordion groups={groupedCredentials} />
      </div>
    </div>
  );
}
