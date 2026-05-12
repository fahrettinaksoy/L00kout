/**
 * Sentry initialisation for the Nitro runtime. No-op when SENTRY_DSN is not
 * configured, so local dev and tests are unaffected.
 */

import * as Sentry from '@sentry/node'

let initialised = false

export const initSentry = (): void => {
  if (initialised) return
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    release: process.env.GIT_SHA,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  })
  initialised = true
}

export const reportError = (err: unknown, context?: Record<string, unknown>): void => {
  if (!initialised) return
  Sentry.captureException(err, { extra: context })
}
