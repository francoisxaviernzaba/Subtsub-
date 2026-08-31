/**
 * Single-blob secret management.
 *
 * Instead of pasting 8+ individual env vars into Vercel, the operator only
 * pastes ONE value: SECRETS_BLOB (a JSON object encrypted with a master key).
 *
 * In production (Vercel):
 *   - Vercel encrypts env vars at rest with KMS
 *   - SECRETS_BLOB is the only thing visible in the Vercel UI
 *   - All other secrets are derived from it at runtime
 *
 * In local dev:
 *   - Set individual env vars in .env (existing behavior) — these still work
 *   - If SECRETS_BLOB is set, it takes precedence
 *
 * Format of the cleartext JSON (before you encrypt it with `pnpm secrets:encrypt`):
 *   {
 *     "authSecret": "...",
 *     "googleClientId": "...",
 *     "googleClientSecret": "...",
 *     "youtubeApiKey": "...",
 *     "youtubeClientId": "...",
 *     "youtubeClientSecret": "...",
 *     "tokenEncKey": "...",
 *     "adminEmails": "you@gmail.com",
 *     "stripeSecretKey": "",
 *     "stripeWebhookSecret": ""
 *   }
 *
 * The cleartext is encrypted with AES-256-GCM using a master passphrase
 * (SECRETS_MASTER_KEY) that is also stored in Vercel — but this can be the
 * SAME as TOKEN_ENC_KEY for simplicity, or you can use a fresh one.
 *
 * Threat model:
 *   - Vercel dashboard screenshot leak: SECRETS_BLOB is opaque
 *   - Repo leak: only the encrypted blob is in env (env vars aren't in the repo anyway)
 *   - Runtime memory: secrets are decrypted once per cold start, cached in process memory
 *   - DB leak: tokens are still encrypted with TOKEN_ENC_KEY (per-user AES-GCM)
 */

import crypto from "node:crypto";

export type Secrets = {
  authSecret: string;
  googleClientId: string;
  googleClientSecret: string;
  youtubeApiKey: string;
  youtubeClientId: string;
  youtubeClientSecret: string;
  tokenEncKey: string;
  adminEmails: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  // Optional overrides
  paymentProvider?: "mock" | "stripe";
  youtubeRedirectUri?: string;
};

let cached: Secrets | null = null;

function getMasterKey(): Buffer {
  // Reuse TOKEN_ENC_KEY as the master key. Operators can set it once and use
  // it for both purposes. The blob is encrypted client-side before being
  // pasted into Vercel — Vercel itself adds another layer at rest.
  const k = process.env.SECRETS_MASTER_KEY || process.env.TOKEN_ENC_KEY || "";
  if (!k) {
    // Dev fallback so the app boots without secrets configured
    return crypto.createHash("sha256").update("dev-fallback-master-key").digest();
  }
  // Accept either base64 or raw
  if (k.length === 44 || k.endsWith("=")) {
    try { return Buffer.from(k, "base64"); } catch { /* fallthrough */ }
  }
  return crypto.createHash("sha256").update(k).digest();
}

export function decryptSecrets(blob: string): Secrets {
  const parts = blob.split(".");
  if (parts.length !== 3) throw new Error("Invalid SECRETS_BLOB format. Run `pnpm secrets:encrypt` to generate one.");
  const [ivB64, tagB64, encB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const key = getMasterKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8")) as Secrets;
}

export function encryptSecrets(plain: Secrets): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(JSON.stringify(plain), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), enc.toString("base64")].join(".");
}

/**
 * Get all secrets, preferring SECRETS_BLOB if set, otherwise individual env vars.
 * Cached for the lifetime of the process.
 */
export function getSecrets(): Secrets {
  if (cached) return cached;
  if (process.env.SECRETS_BLOB) {
    cached = decryptSecrets(process.env.SECRETS_BLOB);
    return cached;
  }
  cached = {
    authSecret: process.env.AUTH_SECRET || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    youtubeApiKey: process.env.YOUTUBE_API_KEY || "",
    youtubeClientId: process.env.YOUTUBE_CLIENT_ID || "",
    youtubeClientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    tokenEncKey: process.env.TOKEN_ENC_KEY || "",
    adminEmails: process.env.ADMIN_EMAILS || "",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    paymentProvider: (process.env.PAYMENT_PROVIDER as "mock" | "stripe") || "mock",
    youtubeRedirectUri: process.env.YOUTUBE_REDIRECT_URI,
  };
  return cached;
}

/** Apply secrets to process.env. Call once at boot. */
export function applySecrets(): void {
  const s = getSecrets();
  if (s.authSecret) process.env.AUTH_SECRET = s.authSecret;
  if (s.googleClientId) process.env.GOOGLE_CLIENT_ID = s.googleClientId;
  if (s.googleClientSecret) process.env.GOOGLE_CLIENT_SECRET = s.googleClientSecret;
  if (s.youtubeApiKey) process.env.YOUTUBE_API_KEY = s.youtubeApiKey;
  if (s.youtubeClientId) process.env.YOUTUBE_CLIENT_ID = s.youtubeClientId;
  if (s.youtubeClientSecret) process.env.YOUTUBE_CLIENT_SECRET = s.youtubeClientSecret;
  if (s.tokenEncKey) process.env.TOKEN_ENC_KEY = s.tokenEncKey;
  if (s.adminEmails) process.env.ADMIN_EMAILS = s.adminEmails;
  if (s.stripeSecretKey) process.env.STRIPE_SECRET_KEY = s.stripeSecretKey;
  if (s.stripeWebhookSecret) process.env.STRIPE_WEBHOOK_SECRET = s.stripeWebhookSecret;
  if (s.paymentProvider) process.env.PAYMENT_PROVIDER = s.paymentProvider;
  // Auto-derive the YouTube redirect URI from the current Vercel/deployment URL
  if (!s.youtubeRedirectUri && process.env.VERCEL_URL) {
    process.env.YOUTUBE_REDIRECT_URI = `https://${process.env.VERCEL_URL}/api/youtube/callback`;
  }
}
