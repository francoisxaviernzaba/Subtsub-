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

### Deploy to Vercel (one-click)

1. Push to GitHub (done)
2. Go to [vercel.com/new](https://vercel.com/new) → import `francoisxaviernzaba/Subtsub-`
3. In **Storage** tab → add **Neon Postgres** integration (free) → this auto-injects `DATABASE_URL` into all environments. No manual DB config needed.
4. Add the remaining env vars in **Settings → Environment Variables** (use the table below).
5. Deploy. The build command (`prisma generate && prisma db push && next build`) auto-creates all tables on first build.

| Variable | Where to get it |
| --- | --- |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL (e.g. `https://sub2sub.vercel.app`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) — add redirect URI `${NEXTAUTH_URL}/api/auth/callback/google` |
| `YOUTUBE_API_KEY` | Same project → Enable "YouTube Data API v3" → API key |
| `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` | New OAuth client "Web" — redirect URI `${NEXTAUTH_URL}/api/youtube/callback` |
| `YOUTUBE_REDIRECT_URI` | Same as `${NEXTAUTH_URL}/api/youtube/callback` |
| `TOKEN_ENC_KEY` | `openssl rand -base64 32` |
| `ADMIN_EMAILS` | Comma-separated — your Google email becomes ADMIN on first login |
| `PAYMENT_PROVIDER` | `mock` (default) or `stripe` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Only if using Stripe |

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
