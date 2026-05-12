import { describe, expect, it } from 'vitest'
import { isIp, isIpv4, isIpv6, parseTarget } from '../shared/url'

describe('isIpv4', () => {
  it.each([
    ['0.0.0.0', true],
    ['127.0.0.1', true],
    ['255.255.255.255', true],
    ['8.8.8.8', true],
    ['256.0.0.1', false],
    ['1.2.3', false],
    ['1.2.3.4.5', false],
    ['1.2.3.04', false], // strict: leading zeros rejected
    ['a.b.c.d', false],
    ['', false],
  ])('isIpv4(%s) === %s', (input, expected) => {
    expect(isIpv4(input)).toBe(expected)
  })
})

describe('isIpv6', () => {
  it('accepts canonical IPv6', () => {
    expect(isIpv6('::1')).toBe(true)
    expect(isIpv6('fe80::1')).toBe(true)
    expect(isIpv6('2001:db8::1')).toBe(true)
  })
  it('rejects IPv4 strings', () => {
    expect(isIpv6('1.2.3.4')).toBe(false)
  })
})

describe('isIp', () => {
  it('combines v4 + v6', () => {
    expect(isIp('1.1.1.1')).toBe(true)
    expect(isIp('::1')).toBe(true)
    expect(isIp('example.com')).toBe(false)
  })
})

describe('parseTarget', () => {
  it('returns null for empty / whitespace', () => {
    expect(parseTarget('')).toBeNull()
    expect(parseTarget('   ')).toBeNull()
    expect(parseTarget(null as unknown as string)).toBeNull()
    expect(parseTarget(123 as unknown as string)).toBeNull()
  })

  it('adds https:// when protocol missing', () => {
    const t = parseTarget('example.com')
    expect(t?.url.startsWith('https://')).toBe(true)
    expect(t?.hostname).toBe('example.com')
  })

  it('preserves http:// when given explicitly', () => {
    const t = parseTarget('http://example.com')
    expect(t?.url.startsWith('http://')).toBe(true)
  })

  it('lowercases hostname', () => {
    expect(parseTarget('ExaMPLE.com')?.hostname).toBe('example.com')
  })

  it('rejects bare TLDs', () => {
    expect(parseTarget('localhost')).toBeNull()
    expect(parseTarget('com')).toBeNull()
  })

  it('rejects invalid hostnames', () => {
    expect(parseTarget('--bad.com')).toBeNull()
    expect(parseTarget('a..b.com')).toBeNull()
    expect(parseTarget('a'.repeat(64) + '.com')).toBeNull()
  })

  it('detects IPv4', () => {
    const t = parseTarget('8.8.8.8')
    expect(t?.isIpv4).toBe(true)
    expect(t?.isIp).toBe(true)
    expect(t?.isIpv6).toBe(false)
  })

  it('detects IPv6', () => {
    const t = parseTarget('[2001:db8::1]')
    expect(t?.isIpv6).toBe(true)
    expect(t?.isIp).toBe(true)
  })

  it('trims input', () => {
    expect(parseTarget('  example.com  ')?.hostname).toBe('example.com')
  })

  it('rejects malformed URLs', () => {
    expect(parseTarget('http://')).toBeNull()
    expect(parseTarget('://nope')).toBeNull()
  })
})
