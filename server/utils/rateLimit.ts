/**
 * In-memory sliding-window rate limiter keyed by client IP.
 *
 * Suitable for single-instance deployments. For horizontal scaling, swap
 * the backing Map with a shared store (Redis / Cloudflare KV / Nitro
 * unstorage) — the API is intentionally a single `consume()` call.
 */

import { getRequestIP, type H3Event } from 'h3'
import { AppError } from './errors'
import { rateLimitTotal } from './metrics'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const SWEEP_INTERVAL_MS = 60_000
let sweepHandle: NodeJS.Timeout | null = null

const startSweeper = (): void => {
  if (sweepHandle) return
  sweepHandle = setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, SWEEP_INTERVAL_MS)
  // Don't keep the process alive just for sweeping.
  sweepHandle.unref?.()
}

export interface RateLimitConfig {
  windowMs: number
  max: number
  keyPrefix?: string
}

const DEFAULT: RateLimitConfig = {
  windowMs: 60_000,
  max: 60,
}

const clientKey = (event: H3Event, prefix: string): string => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  return `${prefix}:${ip}`
}

export const consume = (event: H3Event, cfg: Partial<RateLimitConfig> = {}): void => {
  const merged = { ...DEFAULT, ...cfg }
  startSweeper()
  const now = Date.now()
  const key = clientKey(event, merged.keyPrefix ?? 'rl')
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + merged.windowMs })
    setHeaders(event, merged.max, merged.max - 1, now + merged.windowMs)
    return
  }

  if (bucket.count >= merged.max) {
    setHeaders(event, merged.max, 0, bucket.resetAt)
    rateLimitTotal.inc()
    throw new AppError('RATE_LIMITED', 429, {
      retryAfterMs: bucket.resetAt - now,
      limit: merged.max,
      windowMs: merged.windowMs,
    })
  }

  bucket.count += 1
  setHeaders(event, merged.max, merged.max - bucket.count, bucket.resetAt)
}

const setHeaders = (event: H3Event, limit: number, remaining: number, resetAt: number): void => {
  event.node.res.setHeader('X-RateLimit-Limit', String(limit))
  event.node.res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining)))
  event.node.res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))
}

/**
 * Test-only helper. Resets all buckets and the sweeper. Not exported via
 * the public surface in production code paths.
 */
export const __resetRateLimiter = (): void => {
  buckets.clear()
  if (sweepHandle) {
    clearInterval(sweepHandle)
    sweepHandle = null
  }
}
