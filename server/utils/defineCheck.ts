/**
 * `defineCheck` wraps an endpoint handler with the cross-cutting concerns
 * every check needs: input validation, optional SSRF guard, structured
 * logging with timing, stable error mapping, and a Sentry breadcrumb.
 *
 * Usage:
 *   export default defineCheck({
 *     id: 'ssl',
 *     ssrfGuard: true,
 *     handler: async ({ target }) => { ... },
 *   })
 */

import { defineEventHandler, type H3Event } from 'h3'
import { performance } from 'node:perf_hooks'
import { getTarget, type ServerTarget } from './target'
import { assertPublicTarget } from './ssrf'
import { toH3Error, toAppError } from './errors'
import { logger } from './logger'
import { reportError } from './sentry'
import { checkDurationMs, checkRunsTotal, upstreamErrorsTotal } from './metrics'

export interface CheckContext {
  target: ServerTarget
  event: H3Event
}

export interface DefineCheckOptions<T> {
  id: string
  ssrfGuard?: boolean
  handler: (ctx: CheckContext) => Promise<T>
}

export const defineCheck = <T>(opts: DefineCheckOptions<T>) =>
  defineEventHandler(async (event) => {
    const start = performance.now()
    let target: ServerTarget | null = null
    try {
      target = getTarget(event)
      if (opts.ssrfGuard) {
        await assertPublicTarget(target.hostname)
      }
      const result = await opts.handler({ target, event })
      const durationMs = Math.round(performance.now() - start)
      checkRunsTotal.inc({ id: opts.id, outcome: 'success' })
      checkDurationMs.observe({ id: opts.id, outcome: 'success' }, durationMs)
      logger.info({
        type: 'check.completed',
        id: opts.id,
        hostname: target.hostname,
        durationMs,
      })
      return result
    } catch (e) {
      const app = toAppError(e)
      const durationMs = Math.round(performance.now() - start)
      checkRunsTotal.inc({ id: opts.id, outcome: 'error' })
      checkDurationMs.observe({ id: opts.id, outcome: 'error' }, durationMs)
      upstreamErrorsTotal.inc({ id: opts.id, code: app.code })
      logger.error({
        type: 'check.failed',
        id: opts.id,
        hostname: target?.hostname,
        code: app.code,
        status: app.status,
        context: app.context,
        durationMs,
      })
      // Only report unexpected (5xx, non-upstream) errors to Sentry — avoid noise.
      if (app.status >= 500 && app.code === 'INTERNAL_ERROR') {
        reportError(app, { checkId: opts.id, hostname: target?.hostname })
      }
      throw toH3Error(app)
    }
  })
