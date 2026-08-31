import crypto from "node:crypto";

const ALGO = "aes-256-gcm";
const KEY_B64 = process.env.TOKEN_ENC_KEY || "";

function getKey(): Buffer {
  if (!KEY_B64) {
    // dev fallback so app boots; never use in production
    return crypto.createHash("sha256").update("dev-fallback-key-do-not-use-in-prod").digest();
  }
  return Buffer.from(KEY_B64, "base64");
}

export function encryptToken(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

export function decryptToken(payload: string): string {
  const [ivB64, tagB64, encB64] = payload.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return dec.toString("utf8");
}
