import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { listProjectsForUser } from "@/lib/services/project.service";
import { listDivisionsForUser } from "@/lib/services/division.service";
import { ProjectsView } from "@/components/projects/ProjectsView";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [projects, divisions] = await Promise.all([
    listProjectsForUser(userId),
    listDivisionsForUser(userId),
  ]);

  return <ProjectsView initialProjects={projects} initialDivisions={divisions} />;
}
