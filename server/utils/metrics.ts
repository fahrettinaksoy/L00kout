/**
 * Prometheus metrics for the Nitro runtime. Registry is a singleton so
 * counters/histograms accumulate across requests on the same instance.
 *
 * The /api/metrics endpoint exposes the registry in the standard text
 * format scrapeable by Prometheus.
 */

import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

export const registry = new Registry()

collectDefaultMetrics({ register: registry, prefix: 'l00kout_' })

export const checkRunsTotal = new Counter({
  name: 'l00kout_check_runs_total',
  help: 'Total check executions, labelled by id and outcome.',
  labelNames: ['id', 'outcome'] as const,
  registers: [registry],
})

export const checkDurationMs = new Histogram({
  name: 'l00kout_check_duration_ms',
  help: 'Duration of check execution in milliseconds.',
  labelNames: ['id', 'outcome'] as const,
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10_000, 25_000, 40_000],
  registers: [registry],
})

export const upstreamErrorsTotal = new Counter({
  name: 'l00kout_upstream_errors_total',
  help: 'Upstream errors thrown during check execution.',
  labelNames: ['id', 'code'] as const,
  registers: [registry],
})

export const rateLimitTotal = new Counter({
  name: 'l00kout_rate_limit_total',
  help: 'Requests rejected by the per-IP rate limiter.',
  registers: [registry],
})

export const cacheTotal = new Counter({
  name: 'l00kout_cache_total',
  help: 'Cache lookups by bucket and outcome (hit/miss).',
  labelNames: ['bucket', 'outcome'] as const,
  registers: [registry],
})
