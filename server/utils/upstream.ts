/**
 * Upstream HTTP helpers. Centralises fetch + timeout + status mapping +
 * Zod parsing so endpoints don't repeat the same boilerplate.
 */

import type { ZodType } from 'zod'
import { fetchWithTimeout } from './target'
import { AppError } from './errors'

export interface FetchJsonOptions {
  init?: RequestInit
  timeoutMs?: number
  /** Allow non-2xx and return null instead of throwing. */
  softFail?: boolean
}

/**
 * Fetch JSON, validate with a Zod schema, and map any failure into AppError.
 *
 * Returns `null` only when `softFail` is true AND the upstream returned a
 * non-OK status. Validation failures *always* throw — a malformed upstream
 * response is a bug we want to see in Sentry.
 */
export const fetchJson = async <T>(
  url: string,
  schema: ZodType<T>,
  opts: FetchJsonOptions = {},
): Promise<T | null> => {
  const { init, timeoutMs = 10_000, softFail = false } = opts
  let res: Response
  try {
    res = await fetchWithTimeout(url, init, timeoutMs)
  } catch (e) {
    if (softFail) return null
    throw new AppError('UPSTREAM_UNAVAILABLE', 502, { url }, { cause: e })
  }

  if (!res.ok) {
    if (softFail) return null
    throw new AppError('UPSTREAM_HTTP_ERROR', 502, { url, status: res.status })
  }

  let raw: unknown
  try {
    raw = await res.json()
  } catch (e) {
    throw new AppError('UPSTREAM_HTTP_ERROR', 502, { url, reason: 'invalid-json' }, { cause: e })
  }

  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    throw new AppError('UPSTREAM_HTTP_ERROR', 502, {
      url,
      reason: 'schema-mismatch',
      issues: parsed.error.issues.slice(0, 3),
    })
  }
  return parsed.data
}

/**
 * Fetch with timeout that maps low-level errors to AppError. Use this when
 * you need the raw Response (e.g. to read headers) and aren't parsing JSON.
 */
export const fetchOrThrow = async (
  url: string,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> => {
  try {
    return await fetchWithTimeout(url, init, timeoutMs)
  } catch (e) {
    throw new AppError('UPSTREAM_UNAVAILABLE', 502, { url }, { cause: e })
  }
}
