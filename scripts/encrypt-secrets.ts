#!/usr/bin/env tsx
/**
 * Encrypt a secrets JSON file into a single SECRETS_BLOB value.
 *
 * Usage:
 *   pnpm secrets:encrypt
 *
 * It will:
 *   1. Read .env.secrets.json (or prompt you to create one)
 *   2. Encrypt it with SECRETS_MASTER_KEY (or TOKEN_ENC_KEY)
 *   3. Print the resulting SECRETS_BLOB to paste into Vercel
 *
 * Example .env.secrets.json:
 *   {
 *     "authSecret": "...",
 *     "googleClientId": "...",
 *     ...
 *   }
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { encryptSecrets, type Secrets } from "../src/lib/secrets";

const PATH = ".env.secrets.json";

function main() {
  if (!existsSync(PATH)) {
    console.log(`\nFile ${PATH} not found. Creating template...\n`);
    const template: Secrets = {
      authSecret: "openssl-rand-base64-32",
      googleClientId: "",
      googleClientSecret: "",
      youtubeApiKey: "",
      youtubeClientId: "",
      youtubeClientSecret: "",
      tokenEncKey: "openssl-rand-base64-32",
      adminEmails: "you@gmail.com",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
      paymentProvider: "mock",
    };
    writeFileSync(PATH, JSON.stringify(template, null, 2));
    console.log(`Template written to ${PATH}. Fill in your real values, then re-run.\n`);
    process.exit(0);
  }
  const raw = JSON.parse(readFileSync(PATH, "utf8")) as Secrets;
  const blob = encryptSecrets(raw);
  console.log("\n=== SECRETS_BLOB (paste this single value into Vercel) ===\n");
  console.log(blob);
  console.log("\n===========================================================\n");
  console.log("Also set in Vercel:  SECRETS_MASTER_KEY =", process.env.SECRETS_MASTER_KEY || "(use your TOKEN_ENC_KEY value)");
  console.log("And:                 DATABASE_URL       = <Neon integration auto-fills this>");
  console.log("And:                 NEXTAUTH_URL       = https://YOUR-APP.vercel.app");
  console.log("\n");
}

main();
