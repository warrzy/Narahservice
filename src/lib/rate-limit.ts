/**
 * Rate limiter mémoire simple (adapté à une instance Node unique).
 * Pour un cluster multi-processus, remplacer par Redis ou équivalent.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 15 * 60 * 1000,
): { ok: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }

  if (current.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  store.set(key, current);
  return { ok: true, remaining: limit - current.count, retryAfterSec: 0 };
}
