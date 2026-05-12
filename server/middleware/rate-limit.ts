/**
 * Per-IP rate limit on `/api/checks/**`. Configurable via env:
 *   RATE_LIMIT_WINDOW_MS  (default 60000)
 *   RATE_LIMIT_MAX        (default 60 requests per window per IP)
 */

import { defineEventHandler, getRequestURL } from 'h3'
import { consume } from '../utils/rateLimit'
import { toH3Error } from '../utils/errors'

const PROTECTED_PREFIX = '/api/checks/'

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000)
const max = Number(process.env.RATE_LIMIT_MAX ?? 60)

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith(PROTECTED_PREFIX)) return
  try {
    consume(event, { windowMs, max, keyPrefix: 'checks' })
  } catch (e) {
    throw toH3Error(e)
  }
})
