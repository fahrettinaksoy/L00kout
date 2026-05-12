import { describe, expect, it } from 'vitest'
import { parseHsts } from '../server/utils/httpSecurity'

describe('parseHsts', () => {
  it('returns disabled state for null', () => {
    expect(parseHsts(null)).toEqual({
      enabled: false,
      maxAgeSeconds: null,
      includesSubdomains: false,
      preload: false,
      header: null,
    })
  })

  it('parses max-age', () => {
    const result = parseHsts('max-age=31536000')
    expect(result.enabled).toBe(true)
    expect(result.maxAgeSeconds).toBe(31_536_000)
    expect(result.includesSubdomains).toBe(false)
    expect(result.preload).toBe(false)
  })

  it('parses includeSubDomains (case-insensitive)', () => {
    expect(parseHsts('max-age=600; includesubdomains').includesSubdomains).toBe(true)
    expect(parseHsts('max-age=600; INCLUDESUBDOMAINS').includesSubdomains).toBe(true)
  })

  it('parses preload', () => {
    expect(parseHsts('max-age=31536000; includeSubDomains; preload').preload).toBe(true)
  })

  it('tolerates whitespace around max-age', () => {
    expect(parseHsts('max-age = 600').maxAgeSeconds).toBe(600)
  })

  it('handles quoted max-age', () => {
    expect(parseHsts('max-age="600"').maxAgeSeconds).toBe(600)
  })

  it('returns enabled but null maxAge when missing', () => {
    const r = parseHsts('includeSubDomains; preload')
    expect(r.enabled).toBe(true)
    expect(r.maxAgeSeconds).toBeNull()
    expect(r.includesSubdomains).toBe(true)
    expect(r.preload).toBe(true)
  })
})
