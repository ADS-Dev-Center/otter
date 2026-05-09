import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Key } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds, getUserRoleInDivision } from "@/lib/auth";
import { decryptFromString } from "@/lib/crypto";
import { CredentialForm } from "@/components/credentials/CredentialForm";

interface Props {
  params: Promise<{ projectId: string; credentialId: string }>;
}

export default async function EditProjectCredentialPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId, credentialId } = await params;

  const credential = await prisma.credential.findUnique({
    where: { id: credentialId },
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

  if (!credential || credential.projectId !== projectId) notFound();

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(credential.project.divisionId)) notFound();

  const role = await getUserRoleInDivision(
    userId,
    credential.project.divisionId,
  );
  if (role !== "DIVISION_OWNER" && role !== "DIVISION_ADMIN") {
    redirect(`/projects/${projectId}`);
  }

  const initialFields = credential.fields.map((f) => {
    try {
      return {
        key: f.key,
        value: decryptFromString(f.encryptedValue),
        secret: f.secret,
      };
    } catch (err) {
      console.error(`[edit credential] Failed to decrypt field ${f.key}:`, err);
      return {
        key: f.key,
        value: "",
        secret: f.secret,
        decryptionFailed: true,
      };
    }
  });

  const credentialForForm = {
    id: credential.id,
    name: credential.name,
    environment: credential.environment,
    projectId: credential.projectId,
    createdAt: credential.createdAt,
    updatedAt: credential.updatedAt,
    fields: credential.fields.map((f) => ({
      id: f.id,
      key: f.key,
      secret: f.secret,
      credentialId: f.credentialId,
    })),
    project: credential.project,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" className="rounded-lg px-2 text-xs">
          <Link href={`/projects/${projectId}`}>
            <ArrowLeft weight="duotone" size={14} />
            Back to {credential.project.name}
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-(--glass-bg-raised) border border-(--glass-border-subtle) flex items-center justify-center">
            <Key weight="duotone" size={20} color="var(--accent-primary)" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-(--text-primary)">
              Edit credential
            </h1>
            <p className="text-sm text-(--text-muted)">{credential.name}</p>
          </div>
        </div>
      </div>

      <CredentialForm
        mode="edit"
        credential={credentialForForm}
        initialFields={initialFields}
        returnUrl={`/projects/${projectId}`}
      />
    </div>
  );
}
