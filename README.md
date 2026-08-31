# SUB2SUB

A production-style full-stack platform where YouTube creators can earn and spend virtual **Coins** by watching boosted videos and subscribing to boosted channels. Real Google OAuth, real YouTube Data API v3 + OAuth subscription verification, server-side ledger, admin controls, anti-abuse.

## Stack

- **Next.js 14** (App Router) + React + TypeScript
- **Tailwind CSS** + custom design system
- **Prisma** ORM + **PostgreSQL** ([Neon](https://neon.tech) recommended — free, serverless, instant Vercel integration)
- **NextAuth (Auth.js v5)** with Google provider + Prisma adapter
- **YouTube Data API v3** (`googleapis`) for channel/video lookups, subscription verification
- **Zod** server-side validation
- **AES-256-GCM** token encryption at rest

## Features

- Pinterest-style discovery feed (Home) with infinite scroll
- S2S — subscribe-to-earn task list
- Boost — two campaign wizards (Video / Subscriber), budget calculator, campaign management with pause/resume/cancel + refund
- Coin purchase with a pluggable payment provider (`mock` in this build, `stripe` interface ready)
- Notifications (header popover, unread badge, server-side)
- Profile (stats, transactions), Settings (account / notifications / security / YouTube)
- Admin dashboard (KPIs, configurable rewards & budgets, user & campaign oversight, coin adjustments with audit log)
- Middleware route protection
- Rate limiting, idempotency keys on sensitive endpoints
- Atomic Coin ledger (Prisma `$transaction`) with `INSUFFICIENT_BALANCE` rejection
- Permanent YouTube-channel binding enforced at DB level (`@unique` on `YouTubeChannel.userId` and `youtubeId`)

## Getting started

### Local dev

```bash
pnpm install
cp .env.example .env
# Fill DATABASE_URL with a free Neon connection string (https://neon.tech)
# Fill the other secrets (Google, YouTube, AUTH_SECRET, TOKEN_ENC_KEY)
pnpm dev
```

`pnpm dev` automatically pushes the Prisma schema to your Neon DB on first run.

### Deploy to Vercel (one-click, single secret)

1. Push to GitHub (done)
2. Go to [vercel.com/new](https://vercel.com/new) → import `francoisxaviernzaba/Subtsub-`
3. In **Storage** tab → add **Neon Postgres** integration (free) → this auto-injects `DATABASE_URL`.
4. **Encrypt your secrets into ONE value** (run locally):
   ```bash
   pnpm secrets:encrypt        # creates .env.secrets.json template
   # fill .env.secrets.json with your real Google/YouTube/Auth values
   pnpm secrets:encrypt        # prints a single SECRETS_BLOB value
   ```
5. In **Settings → Environment Variables** paste just **3 values**:
   - `SECRETS_BLOB` = the blob from step 4
   - `SECRETS_MASTER_KEY` = a 32-byte random string (used to decrypt; reuse your TOKEN_ENC_KEY value)
   - `NEXTAUTH_URL` = your Vercel URL (e.g. `https://sub2sub.vercel.app`)
6. Deploy. The build command auto-pushes the Prisma schema to Neon.

The `NEXTAUTH_URL` redirect URI for YouTube OAuth is **auto-derived** from `VERCEL_URL`, so you don't have to update it when you change domains.

### Why this is safe
- Vercel encrypts env vars at rest (KMS) — even SECRETS_BLOB is double-encrypted (your AES-GCM layer + Vercel's KMS)
- Your dashboard screenshot only shows opaque `SECRETS_BLOB` / `SECRETS_MASTER_KEY` / `NEXTAUTH_URL`
- Per-user YouTube tokens are still encrypted in the database with AES-256-GCM
- If you prefer not to use the blob, the individual env vars in `.env.example` also work — `applySecrets()` in `src/instrumentation.ts` falls back automatically

### Required env (see `.env.example`)

- `DATABASE_URL` — SQLite path or Postgres URL
- `AUTH_SECRET` — random 32+ chars
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — for sign-in
- `YOUTUBE_API_KEY` — for public Data API lookups
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` — for OAuth subscription verification
- `TOKEN_ENC_KEY` — base64 32 bytes for encrypting stored YouTube tokens
- `PAYMENT_PROVIDER` — `mock` or `stripe`
- `ADMIN_EMAILS` — comma-separated; first Google sign-in with one of these becomes ADMIN

### Scripts

- `pnpm dev` — dev server
- `pnpm build` / `pnpm start` — production
- `pnpm lint` / `pnpm typecheck`
- `pnpm db:push` / `pnpm db:generate` / `pnpm db:seed`

## Architecture notes

- `src/lib/db.ts` — Prisma singleton
- `src/lib/auth.ts` — NextAuth config + helpers (`auth`, `requireUser`, `requireAdmin`)
- `src/lib/coins.ts` — atomic credit/debit, never mutate balances directly
- `src/lib/youtube.ts` — Data API v3 lookups, cache, OAuth, subscription verifier
- `src/lib/crypto.ts` — AES-256-GCM token encryption
- `src/lib/payments.ts` — `PaymentProvider` interface; swap implementations
- `src/lib/ratelimit.ts` — in-memory token bucket
- `src/lib/api.ts` — Zod helpers, idempotency, error mapping
- `src/middleware.ts` — session-cookie route protection

## Production notes

- Switch Prisma datasource to `postgresql` and run `prisma migrate deploy`
- Replace the in-memory rate limiter with Redis/Upstash
- Sign and verify Stripe webhooks in `src/app/api/payments/webhook/route.ts`
- Consider a dedicated KMS for `TOKEN_ENC_KEY` rotation
- Add background re-verification jobs to detect un-subscribes (see `TaskCompletion.state = REVOKED`)

## License

MIT
