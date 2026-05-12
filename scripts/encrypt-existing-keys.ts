/**
 * One-time migration script: encrypts existing plaintext `encryptedKey` values
 * that were copied from the old `key` column during the SQL migration.
 *
 * Run with: npx tsx scripts/encrypt-existing-keys.ts
 */
import "dotenv/config";
import { Pool } from "pg";
import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY_B64 = process.env.CREDENTIAL_ENCRYPTION_KEY;
if (!KEY_B64) {
  console.error("CREDENTIAL_ENCRYPTION_KEY is not set");
  process.exit(1);
}
const KEY = Buffer.from(KEY_B64, "base64");
if (KEY.length !== 32) {
  console.error(`Key must be 32 bytes (got ${KEY.length})`);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

function encryptToString(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64"),
  });
}

function isAlreadyEncrypted(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    return !!(parsed.iv && parsed.tag && parsed.value);
  } catch {
    return false;
  }
}

async function main() {
  // Configure SSL based on environment variable
  // In production, typically set DATABASE_SSL=require or PGSSLMODE=require
  // In local development, omit or set to false for non-SSL connections
  const sslMode = process.env.DATABASE_SSL || process.env.PGSSLMODE || "false";
  const poolConfig: any = {
    connectionString: DATABASE_URL,
  };

  if (sslMode !== "false" && sslMode !== "disable") {
    // Keep the connection encrypted for `require`, but only enforce CA/full verification
    // for the stricter modes.
    poolConfig.ssl = {
      rejectUnauthorized: sslMode === "verify-ca" || sslMode === "verify-full",
    };
  }

  const pool = new Pool(poolConfig);

  let client;
  try {
    client = await pool.connect();

    // Start transaction
    await client.query("BEGIN");

    try {
      const { rows } = await client.query(
        'SELECT id, "encryptedKey" FROM "CredentialField"',
      );
      console.log(`Found ${rows.length} credential fields to check.`);

      let encrypted = 0;
      let skipped = 0;

      for (const row of rows) {
        if (isAlreadyEncrypted(row.encryptedKey)) {
          skipped++;
          continue;
        }

        const encryptedKey = encryptToString(row.encryptedKey);

        await client.query(
          'UPDATE "CredentialField" SET "encryptedKey" = $1 WHERE id = $2',
          [encryptedKey, row.id],
        );

        encrypted++;
      }

      // Commit transaction
      await client.query("COMMIT");
      console.log(
        `Done. Encrypted: ${encrypted}, Already encrypted: ${skipped}`,
      );
    } catch (err) {
      // Rollback on error
      await client.query("ROLLBACK");
      throw err;
    }
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
