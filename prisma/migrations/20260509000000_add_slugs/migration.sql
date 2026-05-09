-- Add slug to Project (nullable first, backfill from id, then constrain)
ALTER TABLE "Project" ADD COLUMN "slug" TEXT;
UPDATE "Project" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- Add slug to Credential (nullable first, backfill from id, then constrain)
ALTER TABLE "Credential" ADD COLUMN "slug" TEXT;
UPDATE "Credential" SET "slug" = "id" WHERE "slug" IS NULL;
ALTER TABLE "Credential" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "Credential_projectId_slug_key" ON "Credential"("projectId", "slug");
