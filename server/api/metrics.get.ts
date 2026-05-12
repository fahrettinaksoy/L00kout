/**
 * Prometheus scrape endpoint.
 *
 * Protected by a shared bearer token from `METRICS_TOKEN`. If the env var
 * is unset, the endpoint returns 404 — assume metrics are not desired in
 * this deployment rather than exposing them publicly.
 */

import { defineEventHandler, getHeader, setResponseHeader } from 'h3'
import { registry } from '../utils/metrics'
import { AppError, toH3Error } from '../utils/errors'

export default defineEventHandler(async (event) => {
  const token = process.env.METRICS_TOKEN
  if (!token) {
    throw toH3Error(new AppError('NOT_FOUND', 404))
  }
  const provided = (getHeader(event, 'authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (provided !== token) {
    throw toH3Error(new AppError('INVALID_INPUT', 401))
  }
  setResponseHeader(event, 'Content-Type', registry.contentType)
  return await registry.metrics()
})
