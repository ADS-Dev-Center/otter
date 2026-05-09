import crypto from "crypto";

const ALGO = "aes-256-gcm";
const KEY_B64 = process.env.CREDENTIAL_ENCRYPTION_KEY;
if (!KEY_B64) throw new Error("CREDENTIAL_ENCRYPTION_KEY is not set");
const KEY = Buffer.from(KEY_B64, "base64");
if (KEY.length !== 32) {
  throw new Error(
    `CREDENTIAL_ENCRYPTION_KEY must be 32 bytes (got ${KEY.length}). Generate a new key with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
  );
}

export interface EncryptedPayload {
  iv: string;
  tag: string;
  value: string;
}

export function encrypt(plaintext: string): EncryptedPayload {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv, { authTagLength: 16 });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    value: encrypted.toString("base64"),
  };
}

export function decrypt(payload: EncryptedPayload): string {
  const iv = Buffer.from(payload.iv, "base64");
  const tag = Buffer.from(payload.tag, "base64");
  const ciphertext = Buffer.from(payload.value, "base64");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function encryptToString(plaintext: string): string {
  return JSON.stringify(encrypt(plaintext));
}

export function decryptFromString(raw: string): string {
  const payload = JSON.parse(raw) as EncryptedPayload;
  return decrypt(payload);
}
