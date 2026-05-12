/**
 * Pure mapping helpers from CheckStatus → display tokens (icon, color,
 * formatted duration). Extracted from CheckCard* components so they are
 * unit-testable without spinning up Vue.
 */

import type { CheckStatus, CheckResult } from '~/types/check'

export const statusColor = (status: CheckStatus | undefined): string => {
  switch (status) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    case 'loading':
      return 'info'
    default:
      return 'grey'
  }
}

export const statusIcon = (status: CheckStatus | undefined): string => {
  switch (status) {
    case 'success':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    case 'loading':
      return 'mdi-loading mdi-spin'
    default:
      return 'mdi-circle-outline'
  }
}

/** Returns duration in seconds with two decimal places, or null. */
export const formatDuration = (result: CheckResult | undefined): number | null => {
  if (!result?.startedAt || !result?.finishedAt) return null
  return Number(((result.finishedAt - result.startedAt) / 1000).toFixed(2))
}

/**
 * Derive a check id from a renderer filename (e.g. `HttpSecurityRenderer.vue`
 * → `http-security`). Used by the auto-load renderer registry.
 */
export const checkIdFromRendererPath = (path: string): string => {
  const base = path
    .split('/')
    .pop()!
    .replace(/Renderer\.vue$/, '')
  return base
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}
