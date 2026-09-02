#!/usr/bin/env bash
# ============================================================================
# SUB2SUB — Vercel CLI one-command deploy
# ============================================================================
# Usage:
#   1. Install Vercel CLI:  npm i -g vercel
#   2. Login:               vercel login
#   3. Link project:        vercel link  (or run this script, it auto-links)
#   4. Run:                 ./scripts/deploy.sh
#
# This script:
#   - Builds the project
#   - Pushes env vars (idempotent — won't re-add if already present)
#   - Deploys to production
# ============================================================================

set -e

PROJECT_NAME="subtsub"

echo "→ Logging into Vercel (if needed)..."
vercel whoami >/dev/null 2>&1 || vercel login

echo "→ Linking project..."
if [ ! -d ".vercel" ]; then
  vercel link --yes --project "$PROJECT_NAME" 2>/dev/null || \
  vercel link --yes
fi

# Read .env.secrets.json (local, never committed) to extract secrets
if [ ! -f ".env.secrets.json" ]; then
  echo "✗ .env.secrets.json not found."
  echo "  Run: pnpm secrets:encrypt  (creates template)  →  fill it  →  re-run"
  exit 1
fi

# Helper: add env var if not already set on Vercel
add_env() {
  local key="$1"
  local value="$2"
  local environments="${3:-production preview}"
  # Check if already set
  if vercel env ls 2>/dev/null | grep -q "^$key$"; then
    echo "  ✓ $key (already set, skipping)"
  else
    echo "  + $key"
    echo "$value" | vercel env add "$key" "$environments" <<< "$value" >/dev/null 2>&1 || \
    vercel env add "$key" "$environments" < <(echo "$value") >/dev/null 2>&1
  fi
}

echo "→ Reading local secrets..."
SECRETS=$(cat .env.secrets.json)

# Extract values (assumes JSON, no newlines in values)
NEXTAUTH_URL_VAL="https://${PROJECT_NAME}.vercel.app"
AUTH_SECRET_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['authSecret'])")
GOOGLE_CLIENT_ID_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['googleClientId'])")
GOOGLE_CLIENT_SECRET_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['googleClientSecret'])")
YOUTUBE_API_KEY_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['youtubeApiKey'])")
YOUTUBE_CLIENT_ID_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['youtubeClientId'])")
YOUTUBE_CLIENT_SECRET_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['youtubeClientSecret'])")
TOKEN_ENC_KEY_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['tokenEncKey'])")
ADMIN_EMAILS_VAL=$(echo "$SECRETS" | python3 -c "import sys,json;print(json.load(sys.stdin)['adminEmails'])")

echo "→ Setting env vars on Vercel..."
add_env "NEXTAUTH_URL" "$NEXTAUTH_URL_VAL"
add_env "AUTH_SECRET" "$AUTH_SECRET_VAL"
add_env "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID_VAL"
add_env "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET_VAL"
add_env "YOUTUBE_API_KEY" "$YOUTUBE_API_KEY_VAL"
add_env "YOUTUBE_CLIENT_ID" "$YOUTUBE_CLIENT_ID_VAL"
add_env "YOUTUBE_CLIENT_SECRET" "$YOUTUBE_CLIENT_SECRET_VAL"
add_env "TOKEN_ENC_KEY" "$TOKEN_ENC_KEY_VAL"
add_env "ADMIN_EMAILS" "$ADMIN_EMAILS_VAL"
add_env "PAYMENT_PROVIDER" "mock"
add_env "YOUTUBE_REDIRECT_URI" "https://${PROJECT_NAME}.vercel.app/api/youtube/callback"

echo "→ Building..."
pnpm install --ignore-scripts
pnpm exec prisma generate
pnpm exec next build

echo "→ Deploying to production..."
vercel deploy --prod --yes

echo ""
echo "✓ Done!  Visit https://${PROJECT_NAME}.vercel.app"
echo ""
echo "Next steps:"
echo "  1. Update Google Cloud OAuth redirect URIs to:"
echo "     - https://${PROJECT_NAME}.vercel.app/api/auth/callback/google"
echo "     - https://${PROJECT_NAME}.vercel.app/api/youtube/callback"
echo "  2. Connect Neon DB: Vercel → Storage → Add Postgres → Neon"
echo "  3. Run DB migration:"
echo "     DATABASE_URL=<neon-url> pnpm db:migrate:deploy"
