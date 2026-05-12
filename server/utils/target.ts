/**
 * Server-side target extraction. Delegates parsing to the shared module
 * (`shared/url.ts`) so client and server cannot drift apart, and raises
 * AppError with stable error codes instead of leaking raw messages.
 */

import { getQuery, type H3Event } from 'h3'
import { parseTarget, type TargetInfo } from '../../shared/url'
import { AppError } from './errors'

export type ServerTarget = TargetInfo

export const getTarget = (event: H3Event): ServerTarget => {
  const q = getQuery(event)
  const raw = q.url ?? q.target
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new AppError('URL_REQUIRED', 400)
  }
  const parsed = parseTarget(raw)
  if (!parsed) {
    throw new AppError('INVALID_URL', 400, { input: raw })
  }
  return parsed
}

const DEFAULT_TIMEOUT_MS = 15_000

export const fetchWithTimeout = async (
  url: string,
  init: RequestInit = {},
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> => {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal })
  } finally {
    clearTimeout(t)
  }
}
