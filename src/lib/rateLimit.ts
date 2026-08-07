/**
 * Minimal in-memory rate limiter for auth endpoints (login, register, forgot-password).
 *
 * Note: this is a best-effort mitigation, not a complete solution — on serverless
 * platforms (Vercel) each cold-started instance has its own memory, so a determined
 * attacker distributing requests across many cold starts can bypass it. For strong
 * guarantees, use a shared store (Redis/Upstash) instead. This still meaningfully
 * slows down casual brute-force/spam attempts against a single warm instance.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically clear stale buckets so the Map doesn't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

/**
 * Returns true if the request should be ALLOWED, false if it should be BLOCKED.
 * @param key Unique identifier for this limiter, e.g. `login:${ip}`
 * @param limit Max requests allowed within the window
 * @param windowMs Window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** Best-effort client IP extraction from standard proxy headers. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
