import { prisma } from "@/lib/prisma";
import { AuditAction } from "@/app/generated/prisma/enums";

type AuditPayload = {
  actorId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  resourceName: string;
  credentialId?: string;
  divisionId?: string;
  metadata?: {
    oldValue?: string;
    newValue?: string;
    changeDescription?: string;
  };
};

export async function writeAuditLog(payload: AuditPayload) {
  await prisma.auditLog.create({ data: payload });
}
