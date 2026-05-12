-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'CREDENTIAL_COPY';
ALTER TYPE "AuditAction" ADD VALUE 'PROJECT_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'PROJECT_UPDATE';
ALTER TYPE "AuditAction" ADD VALUE 'PROJECT_DELETE';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_INVITE';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_ROLE_CHANGE';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBER_REMOVE';
ALTER TYPE "AuditAction" ADD VALUE 'DIVISION_CREATE';
ALTER TYPE "AuditAction" ADD VALUE 'DIVISION_RENAME';
ALTER TYPE "AuditAction" ADD VALUE 'DIVISION_DELETE';

-- AlterTable: add as nullable first to allow backfill
ALTER TABLE "AuditLog" ADD COLUMN "resourceId" TEXT,
ADD COLUMN "resourceName" TEXT,
ADD COLUMN "resourceType" TEXT;

-- Backfill resourceType for all existing rows (all were credential events)
UPDATE "AuditLog" SET "resourceType" = 'CREDENTIAL' WHERE "resourceType" IS NULL;

-- Backfill resourceId from credentialId where available
UPDATE "AuditLog" SET "resourceId" = "credentialId" WHERE "resourceId" IS NULL AND "credentialId" IS NOT NULL;

-- Backfill resourceName from linked credential name, fall back to 'Unknown'
UPDATE "AuditLog" al
SET "resourceName" = COALESCE(
  (SELECT c.name FROM "Credential" c WHERE c.id = al."credentialId"),
  'Unknown'
)
WHERE al."resourceName" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "AuditLog" ALTER COLUMN "resourceType" SET NOT NULL;
ALTER TABLE "AuditLog" ALTER COLUMN "resourceName" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;
