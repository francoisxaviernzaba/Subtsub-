/**
 * Next.js instrumentation hook — runs once per server process on cold start.
 * Perfect place to decrypt SECRETS_BLOB before any route handler runs.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { applySecrets } = await import("./lib/secrets");
    applySecrets();
  }
}
