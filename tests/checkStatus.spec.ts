import { describe, expect, it } from 'vitest'
import {
  checkIdFromRendererPath,
  formatDuration,
  statusColor,
  statusIcon,
} from '../app/composables/useCheckStatus'

describe('statusColor', () => {
  it.each([
    ['success', 'success'],
    ['error', 'error'],
    ['loading', 'info'],
    ['idle', 'grey'],
    [undefined, 'grey'],
  ] as const)('statusColor(%s) === %s', (status, expected) => {
    expect(statusColor(status as never)).toBe(expected)
  })
})

describe('statusIcon', () => {
  it('returns mdi icons for each state', () => {
    expect(statusIcon('success')).toBe('mdi-check-circle')
    expect(statusIcon('error')).toBe('mdi-alert-circle')
    expect(statusIcon('loading')).toBe('mdi-loading mdi-spin')
    expect(statusIcon('idle')).toBe('mdi-circle-outline')
    expect(statusIcon(undefined)).toBe('mdi-circle-outline')
  })
})

describe('formatDuration', () => {
  it('returns null when timestamps are missing', () => {
    expect(formatDuration(undefined)).toBeNull()
    expect(formatDuration({ id: 'x', status: 'loading', startedAt: 1 })).toBeNull()
    expect(formatDuration({ id: 'x', status: 'success', finishedAt: 1 })).toBeNull()
  })
  it('returns seconds with two-decimal rounding', () => {
    expect(formatDuration({ id: 'x', status: 'success', startedAt: 1000, finishedAt: 1500 })).toBe(
      0.5,
    )
    expect(
      formatDuration({ id: 'x', status: 'success', startedAt: 1000, finishedAt: 3456 }),
    ).toBeCloseTo(2.46, 2)
  })
})

describe('checkIdFromRendererPath', () => {
  it.each([
    ['./renderers/SslRenderer.vue', 'ssl'],
    ['./renderers/HttpSecurityRenderer.vue', 'http-security'],
    ['./renderers/MailConfigRenderer.vue', 'mail-config'],
    ['./renderers/TraceRouteRenderer.vue', 'trace-route'],
    ['./renderers/DnsRenderer.vue', 'dns'],
    ['./renderers/RobotsRenderer.vue', 'robots'],
    ['/abs/path/to/SecurityTxtRenderer.vue', 'security-txt'],
  ])('%s → %s', (input, expected) => {
    expect(checkIdFromRendererPath(input)).toBe(expected)
  })
})
