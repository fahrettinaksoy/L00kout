import { describe, expect, it } from 'vitest'
import { AppError, toAppError, toH3Error } from '../server/utils/errors'

describe('AppError', () => {
  it('captures code, status, context', () => {
    const e = new AppError('SSRF_BLOCKED', 400, { hostname: 'x' })
    expect(e.code).toBe('SSRF_BLOCKED')
    expect(e.status).toBe(400)
    expect(e.context).toEqual({ hostname: 'x' })
  })

  it('preserves cause', () => {
    const cause = new Error('boom')
    const e = new AppError('INTERNAL_ERROR', 500, {}, { cause })
    expect(e.cause).toBe(cause)
  })
})

describe('toAppError', () => {
  it('passes through AppError', () => {
    const original = new AppError('RATE_LIMITED', 429)
    expect(toAppError(original)).toBe(original)
  })

  it('maps AbortError → UPSTREAM_TIMEOUT', () => {
    const abort = new Error('aborted')
    abort.name = 'AbortError'
    const mapped = toAppError(abort)
    expect(mapped.code).toBe('UPSTREAM_TIMEOUT')
    expect(mapped.status).toBe(504)
  })

  it('maps TimeoutError → UPSTREAM_TIMEOUT', () => {
    const t = new Error('timeout')
    t.name = 'TimeoutError'
    expect(toAppError(t).code).toBe('UPSTREAM_TIMEOUT')
  })

  it('wraps generic Error as INTERNAL_ERROR', () => {
    const mapped = toAppError(new Error('something broke'))
    expect(mapped.code).toBe('INTERNAL_ERROR')
    expect(mapped.status).toBe(500)
    expect(mapped.context.message).toBe('something broke')
  })

  it('wraps non-Error values', () => {
    expect(toAppError('weird').code).toBe('INTERNAL_ERROR')
    expect(toAppError(42).code).toBe('INTERNAL_ERROR')
  })
})

describe('toH3Error', () => {
  it('exposes code and context in data, never raw message in statusMessage', () => {
    const h3 = toH3Error(new AppError('SSRF_BLOCKED', 400, { hostname: 'x' }))
    expect(h3.statusCode).toBe(400)
    expect(h3.statusMessage).toBe('SSRF_BLOCKED')
    expect(h3.data).toEqual({ code: 'SSRF_BLOCKED', context: { hostname: 'x' } })
  })

  it('does not leak internal error details to client', () => {
    const h3 = toH3Error(new Error('postgres connection string ...'))
    expect(h3.statusMessage).toBe('INTERNAL_ERROR')
    expect(JSON.stringify(h3.data)).toContain('INTERNAL_ERROR')
  })
})
