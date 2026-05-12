/**
 * Error code taxonomy. The same `code` is exposed in the HTTP error payload
 * (`data.code`) and used as the i18n key on the client side
 * (`t('errors.' + code, context)`), so the UI can localise messages without
 * needing to interpret arbitrary strings from the server.
 */

import { createError } from 'h3'

export type ErrorCode =
  | 'INVALID_INPUT'
  | 'INVALID_URL'
  | 'INVALID_HOSTNAME'
  | 'URL_REQUIRED'
  | 'SSRF_BLOCKED'
  | 'DNS_RESOLUTION_FAILED'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'UPSTREAM_HTTP_ERROR'
  | 'TLS_HANDSHAKE_FAILED'
  | 'RATE_LIMITED'
  | 'PROVIDER_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'CANCELLED'

export interface ErrorContext {
  [key: string]: unknown
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly status: number
  public readonly context: ErrorContext

  constructor(
    code: ErrorCode,
    status = 500,
    context: ErrorContext = {},
    options?: { cause?: unknown },
  ) {
    super(code, options)
    this.name = 'AppError'
    this.code = code
    this.status = status
    this.context = context
  }
}

const isAbortError = (e: unknown): boolean =>
  e instanceof Error && (e.name === 'AbortError' || e.name === 'TimeoutError')

/**
 * Map any thrown value into a stable `AppError`. Network/abort errors become
 * `UPSTREAM_TIMEOUT`; everything else becomes `INTERNAL_ERROR` with the
 * original error preserved via `cause`.
 */
export const toAppError = (e: unknown): AppError => {
  if (e instanceof AppError) return e
  if (isAbortError(e)) return new AppError('UPSTREAM_TIMEOUT', 504, {}, { cause: e })
  if (e instanceof Error) {
    return new AppError('INTERNAL_ERROR', 500, { message: e.message }, { cause: e })
  }
  return new AppError('INTERNAL_ERROR', 500, { raw: String(e) })
}

/**
 * Convert AppError to an h3 error preserving the code/context in `data` so
 * the client can localise. `statusMessage` is intentionally generic — never
 * leak internal text to the client.
 */
export const toH3Error = (e: unknown) => {
  const app = toAppError(e)
  return createError({
    statusCode: app.status,
    statusMessage: app.code,
    data: {
      code: app.code,
      context: app.context,
    },
  })
}
