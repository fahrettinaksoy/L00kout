/**
 * Thin wrapper around Nitro's built-in storage so we can cache stable
 * upstream lookups (SSL chains, WHOIS, DNS) without re-importing
 * `useStorage` everywhere.
 *
 * Keys are namespaced as `cache:<bucket>:<hash>` so they don't collide
 * with other consumers of the storage layer.
 *
 * Caching is opt-in per call — endpoints decide their own TTL based on
 * data volatility (WHOIS days, DNS minutes, etc.).
 */

import { useStorage } from 'nitropack/runtime'
import { createHash } from 'node:crypto'
import { cacheTotal } from './metrics'

interface Envelope<T> {
  value: T
  expiresAt: number
}

const keyOf = (bucket: string, parts: unknown[]): string => {
  const hash = createHash('sha1').update(parts.map(String).join('|')).digest('hex').slice(0, 24)
  return `cache:${bucket}:${hash}`
}

export const cached = async <T>(
  bucket: string,
  parts: unknown[],
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> => {
  const storage = useStorage()
  const key = keyOf(bucket, parts)
  const envelope = (await storage.getItem<Envelope<T>>(key)) as Envelope<T> | null
  const now = Date.now()
  if (envelope && envelope.expiresAt > now) {
    cacheTotal.inc({ bucket, outcome: 'hit' })
    return envelope.value
  }
  cacheTotal.inc({ bucket, outcome: 'miss' })
  const value = await loader()
  await storage.setItem(key, { value, expiresAt: now + ttlMs })
  return value
}

export const CACHE_TTL = {
  // Reasonable defaults — tuned to data volatility, not load.
  short: 60_000, // 1 minute  — geolocation, headers
  medium: 5 * 60_000, // 5 min     — DNS, screenshot
  long: 60 * 60_000, // 1 hour    — SSL chain, tech stack
  day: 24 * 60 * 60_000, // 24 hours  — WHOIS, RDAP
} as const
