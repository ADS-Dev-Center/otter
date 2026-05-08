-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'DIVISION_OWNER', 'DIVISION_ADMIN', 'MEMBER');

-- CreateTable
CREATE TABLE "Division" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DivisionMembership" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "divisionId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DivisionMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DivisionMembership_clerkId_idx" ON "DivisionMembership"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "DivisionMembership_clerkId_divisionId_key" ON "DivisionMembership"("clerkId", "divisionId");

-- AddForeignKey
ALTER TABLE "DivisionMembership" ADD CONSTRAINT "DivisionMembership_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE CASCADE ON UPDATE CASCADE;
