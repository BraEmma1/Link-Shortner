/**
 * keepAlive.ts
 *
 * Prevents free-tier hosting cold starts (e.g. Render) by:
 *  1. Pinging /api/health immediately on app load to warm the server up early
 *  2. Pinging every 14 minutes to prevent the server sleeping during an active session
 *
 * Render free tier spins down after 15 min of inactivity — this keeps it alive.
 */

const HEALTH_URL = (() => {
  const base =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '').replace(/\/$/, '') ||
    'http://localhost:5000';
  return `${base}/api/health`;
})();

// Interval in ms — 14 min (just under Render's 15 min spin-down threshold)
const PING_INTERVAL_MS = 14 * 60 * 1000;

async function ping() {
  try {
    const res = await fetch(HEALTH_URL, {
      method: 'GET',
      // Don't send cookies for this lightweight ping
      credentials: 'omit',
      // Use a short timeout — this is just a wake-up call, not a critical request
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      console.debug('[keepAlive] Server is warm ✓');
    }
  } catch {
    // Silently ignore — this is a best-effort warm-up, not critical
    console.debug('[keepAlive] Warm-up ping failed (server may be starting up)');
  }
}

let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Call this once on app mount (e.g. in root layout or _app).
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export function startKeepAlive() {
  // Only run in browser
  if (typeof window === 'undefined') return;
  // Prevent duplicate intervals
  if (intervalId !== null) return;

  // Immediate warm-up ping
  ping();

  // Recurring keep-alive
  intervalId = setInterval(ping, PING_INTERVAL_MS);
}

/**
 * Call on app unmount to clean up the interval.
 */
export function stopKeepAlive() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
