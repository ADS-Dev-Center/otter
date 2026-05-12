-- Step 1: Add encryptedKey as nullable
ALTER TABLE "CredentialField" ADD COLUMN "encryptedKey" TEXT;

-- Step 2: Copy key values as-is (will be re-encrypted by migration script)
UPDATE "CredentialField" SET "encryptedKey" = "key";

-- ⚠️  CRITICAL PROCEDURE (DO NOT SKIP):
-- Prisma will run the above statements end-to-end. After this migration completes,
-- you MUST immediately run: npx tsx scripts/encrypt-existing-keys.ts
-- This script re-encrypts plaintext keys in "CredentialField"."encryptedKey" with proper encryption.
-- If NOT executed, "CredentialField"."encryptedKey" values will remain plaintext (SECURITY RISK).
-- Verify after running: check sample "encryptedKey" values contain JSON with {iv, tag, value} fields.
-- 
-- ALTERNATIVE: Split into separate migration after script is verified (see Step 3 below).

-- Step 3: Make encryptedKey NOT NULL (only after successful encryption verification)
-- ⚠️  Run this only after:
--   1. npx tsx scripts/encrypt-existing-keys.ts has completed successfully
--   2. Verification shows "encryptedKey" contains encrypted JSON, not plaintext
-- Consider moving to a separate migration file after verification is confirmed.
ALTER TABLE "CredentialField" ALTER COLUMN "encryptedKey" SET NOT NULL;

-- Step 4: Preserve old columns as deprecated (do not drop - rename for potential recovery)
ALTER TABLE "CredentialField" RENAME COLUMN "key" TO "key_deprecated";
ALTER TABLE "CredentialField" RENAME COLUMN "secret" TO "secret_deprecated";

-- Columns key_deprecated and secret_deprecated should be removed in a separate cleanup migration
-- after encryption verification is complete and backup is confirmed.
