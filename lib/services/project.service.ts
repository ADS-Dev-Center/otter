import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { toSlug } from "@/lib/slug";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "@/lib/validations/project";

export async function listProjectsForUser(
  userId: string,
  divisionId?: string | null,
) {
  const divisionIds = await getUserDivisionIds(userId);

  let filteredIds = divisionIds;
  if (divisionId) {
    if (!divisionIds.includes(divisionId)) {
      throw new ForbiddenError("Not a member of this division");
    }
    filteredIds = [divisionId];
  }

  return prisma.project.findMany({
    where: { divisionId: { in: filteredIds } },
    include: { _count: { select: { credentials: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createProjectForDivision(
  userId: string,
  input: CreateProjectInput,
) {
  const role = await getUserRoleInDivision(userId, input.divisionId);
  if (
    role !== "DIVISION_OWNER" &&
    role !== "DIVISION_ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    throw new ForbiddenError("Only admins can create projects");
  }

  const slug = toSlug(input.name);

  const existing = await prisma.project.findUnique({ where: { slug } });
  if (existing) {
    throw new ConflictError("A project with this name already exists");
  }

  let project;
  try {
    project = await prisma.project.create({
      data: {
        slug,
        name: input.name,
        description: input.description,
        divisionId: input.divisionId,
      },
      include: { _count: { select: { credentials: true } } },
    });
  } catch (error) {
    // Guard against create-time unique race.
    if ((error as { code?: string } | null)?.code === "P2002") {
      throw new ConflictError("A project with this name already exists");
    }
    throw error;
  }

  await writeAuditLog({
    actorId: userId,
    action: "PROJECT_CREATE",
    resourceType: "PROJECT",
    resourceId: project.id,
    resourceName: project.name,
    divisionId: project.divisionId,
  });

  return project;
}

export async function updateProjectById(
  userId: string,
  id: string,
  input: UpdateProjectInput,
) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (
    role !== "DIVISION_OWNER" &&
    role !== "DIVISION_ADMIN" &&
    role !== "SUPER_ADMIN"
  ) {
    throw new ForbiddenError("Only admins can update projects");
  }

  const updated = await prisma.project.update({
    where: { id },
    data: input,
  });

  await writeAuditLog({
    actorId: userId,
    action: "PROJECT_UPDATE",
    resourceType: "PROJECT",
    resourceId: id,
    resourceName: updated.name,
    divisionId: project.divisionId,
  });

  return updated;
}

export async function deleteProjectById(userId: string, id: string) {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (role !== "DIVISION_OWNER" && role !== "SUPER_ADMIN") {
    throw new ForbiddenError("Only the division owner can delete projects");
  }

  // Delete first, then audit log to avoid orphaned audit entries on deletion failure
  await prisma.project.delete({ where: { id } });

  await writeAuditLog({
    actorId: userId,
    action: "PROJECT_DELETE",
    resourceType: "PROJECT",
    resourceId: id,
    resourceName: project.name,
    divisionId: project.divisionId,
  });
}
