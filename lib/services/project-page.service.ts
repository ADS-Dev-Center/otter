import { decryptFromString } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { ForbiddenError, NotFoundError } from "@/lib/errors";

export async function getProjectDetailBySlugForUser(
  userId: string,
  slug: string,
) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: {
      division: {
        include: { _count: { select: { memberships: true } } },
      },
      credentials: {
        include: {
          fields: {
            select: { id: true, key: true, secret: true, credentialId: true },
          },
          project: { select: { id: true, name: true, divisionId: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(project.divisionId)) {
    throw new NotFoundError("Project not found");
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);

  return { project, divisionIds, role };
}

export async function getProjectForCredentialCreate(
  userId: string,
  slug: string,
) {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, name: true, divisionId: true },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(project.divisionId)) {
    throw new NotFoundError("Project not found");
  }

  const role = await getUserRoleInDivision(userId, project.divisionId);
  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can create credentials");
  }

  return project;
}

export async function getCredentialEditData(
  userId: string,
  slug: string,
  credentialSlug: string,
) {
  const project = await prisma.project.findUnique({
    where: { slug },
    select: { id: true, name: true, divisionId: true },
  });

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  const credential = await prisma.credential.findUnique({
    where: { projectId_slug: { projectId: project.id, slug: credentialSlug } },
    include: {
      fields: {
        select: {
          id: true,
          key: true,
          encryptedValue: true,
          secret: true,
          credentialId: true,
        },
      },
      project: { select: { id: true, name: true, divisionId: true } },
    },
  });

  if (!credential) {
    throw new NotFoundError("Credential not found");
  }

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(credential.project.divisionId)) {
    throw new NotFoundError("Credential not found");
  }

  const role = await getUserRoleInDivision(
    userId,
    credential.project.divisionId,
  );
  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    throw new ForbiddenError("Only admins can edit credentials");
  }

  const initialFields = credential.fields.map((field) => {
    try {
      return {
        key: field.key,
        value: decryptFromString(field.encryptedValue),
        secret: field.secret,
      };
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "decryption failed";
      console.error(
        `[getCredentialEditData] Failed to decrypt field ${field.key}: ${errorMsg}`,
      );
      return {
        key: field.key,
        value: "",
        secret: field.secret,
        decryptionFailed: true,
      };
    }
  });

  const credentialForForm = {
    id: credential.id,
    slug: credential.slug,
    name: credential.name,
    environment: credential.environment,
    projectId: credential.projectId,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
    fields: credential.fields.map((field) => ({
      id: field.id,
      key: field.key,
      secret: field.secret,
      credentialId: field.credentialId,
    })),
    project: credential.project,
  };

  return { credential, credentialForForm, initialFields };
}
