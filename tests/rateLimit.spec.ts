import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { H3Event } from 'h3'
import { __resetRateLimiter, consume } from '../server/utils/rateLimit'
import { AppError } from '../server/utils/errors'

const mockEvent = (ip = '1.2.3.4'): H3Event => {
  const headers = new Map<string, string>()
  return {
    node: {
      req: { headers: { 'x-forwarded-for': ip }, socket: { remoteAddress: ip } },
      res: {
        setHeader: (k: string, v: string) => headers.set(k, v),
        getHeader: (k: string) => headers.get(k),
      },
    },
    context: {},
  } as unknown as H3Event
}

describe('rateLimit consume()', () => {
  beforeEach(() => {
    __resetRateLimiter()
    vi.useFakeTimers()
  })
  afterEach(() => {
    __resetRateLimiter()
    vi.useRealTimers()
  })

  it('allows requests below the limit', () => {
    const cfg = { windowMs: 1000, max: 3 }
    for (let i = 0; i < 3; i++) {
      expect(() => consume(mockEvent(), cfg)).not.toThrow()
    }
  })

  it('throws RATE_LIMITED on the (max+1)-th request', () => {
    const cfg = { windowMs: 1000, max: 2 }
    consume(mockEvent(), cfg)
    consume(mockEvent(), cfg)
    try {
      consume(mockEvent(), cfg)
      throw new Error('should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(AppError)
      expect((e as AppError).code).toBe('RATE_LIMITED')
      expect((e as AppError).status).toBe(429)
    }
  })

  it('refills after the window elapses', () => {
    const cfg = { windowMs: 1000, max: 1 }
    consume(mockEvent(), cfg)
    vi.advanceTimersByTime(1001)
    expect(() => consume(mockEvent(), cfg)).not.toThrow()
  })

  it('tracks separate buckets per IP', () => {
    const cfg = { windowMs: 1000, max: 1 }
    consume(mockEvent('1.1.1.1'), cfg)
    expect(() => consume(mockEvent('2.2.2.2'), cfg)).not.toThrow()
    expect(() => consume(mockEvent('1.1.1.1'), cfg)).toThrow()
  })

  it('sets X-RateLimit headers', () => {
    const headers = new Map<string, string>()
    const event = {
      node: {
        req: { headers: {}, socket: { remoteAddress: '9.9.9.9' } },
        res: { setHeader: (k: string, v: string) => headers.set(k, v) },
      },
      context: {},
    } as unknown as H3Event
    consume(event, { windowMs: 1000, max: 5 })
    expect(headers.get('X-RateLimit-Limit')).toBe('5')
    expect(headers.get('X-RateLimit-Remaining')).toBe('4')
    expect(headers.get('X-RateLimit-Reset')).toMatch(/^\d+$/)
  })
})
