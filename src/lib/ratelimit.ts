// Simple in-memory token bucket rate limiter (per process).
// In production use Redis/Upstash. This is sufficient for single-instance.
type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, capacity: number, refillPerSec: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: capacity, updatedAt: now };
  const elapsed = (now - b.updatedAt) / 1000;
  b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerSec);
  b.updatedAt = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return false;
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return true;
}

export function getClientKey(req: Request, userId?: string): string {
  if (userId) return `u:${userId}`;
  const fwd = req.headers.get("x-forwarded-for") || "anon";
  return `ip:${fwd.split(",")[0].trim()}`;
}
