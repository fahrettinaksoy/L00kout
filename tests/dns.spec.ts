import { describe, expect, it } from 'vitest'
import { classifyTxt } from '../server/utils/dns'

describe('classifyTxt', () => {
  it('classifies SPF', () => {
    expect(classifyTxt('v=spf1 include:_spf.google.com ~all')).toBe('spf')
    expect(classifyTxt('V=SPF1 -all')).toBe('spf')
  })
  it('classifies DMARC', () => {
    expect(classifyTxt('v=DMARC1; p=reject; rua=mailto:dmarc@example.com')).toBe('dmarc')
  })
  it('classifies DKIM', () => {
    expect(classifyTxt('v=DKIM1; k=rsa; p=...')).toBe('dkim')
  })
  it('classifies BIMI', () => {
    expect(classifyTxt('v=BIMI1; l=https://example.com/logo.svg')).toBe('bimi')
  })
  it.each([
    'google-site-verification=abc123',
    'MS=ms12345',
    'facebook-domain-verification=xyz',
    'apple-domain-verification=ABC',
    'random-domain-verification=xyz',
  ])('classifies %s as verification', (rec) => {
    expect(classifyTxt(rec)).toBe('verification')
  })
  it('falls through to other', () => {
    expect(classifyTxt('hello world')).toBe('other')
    expect(classifyTxt('')).toBe('other')
  })
  it('trims whitespace', () => {
    expect(classifyTxt('   v=spf1 -all  ')).toBe('spf')
  })
})
