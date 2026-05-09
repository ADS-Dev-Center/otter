import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserDivisionIds } from "@/lib/auth";
import { decryptFromString } from "@/lib/crypto";
import { writeAuditLog } from "@/lib/audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const { id } = await params;

  const credential = await prisma.credential.findUnique({
    where: { id },
    include: {
      project: { select: { divisionId: true } },
      fields: true,
    },
  });

  if (!credential) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Credential not found" } },
      { status: 404 },
    );
  }

  const divisionIds = await getUserDivisionIds(userId);
  if (!divisionIds.includes(credential.project.divisionId)) {
    return NextResponse.json(
      {
        error: { code: "FORBIDDEN", message: "Not a member of this division" },
      },
      { status: 403 },
    );
  }

  const decryptedFields = credential.fields.map((f) => {
    try {
      return {
        id: f.id,
        key: f.key,
        value: decryptFromString(f.encryptedValue),
        secret: f.secret,
        credentialId: f.credentialId,
      };
    } catch (err) {
      console.error(`[reveal] Failed to decrypt field ${f.id}:`, err);
      return {
        id: f.id,
        key: f.key,
        value: "",
        secret: f.secret,
        credentialId: f.credentialId,
        decryptionFailed: true,
      };
    }
  });

  await writeAuditLog({
    actorId: userId,
    action: "CREDENTIAL_VIEW",
    resourceType: "CREDENTIAL",
    resourceId: id,
    resourceName: credential.name,
    credentialId: id,
    divisionId: credential.project.divisionId,
  });

  return NextResponse.json({ data: decryptedFields });
}
