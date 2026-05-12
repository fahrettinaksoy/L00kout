import { describe, expect, it } from 'vitest'
import { isPrivateIp, isPrivateIpv4, isPrivateIpv6 } from '../server/utils/ssrf'

describe('isPrivateIpv4', () => {
  it.each([
    ['127.0.0.1', true],
    ['10.0.0.1', true],
    ['172.16.0.1', true],
    ['172.31.255.255', true],
    ['192.168.1.1', true],
    ['169.254.169.254', true], // AWS metadata
    ['100.64.0.1', true], // CGNAT
    ['224.0.0.1', true], // multicast
    ['0.0.0.0', true],
    ['255.255.255.255', true],
    ['8.8.8.8', false],
    ['1.1.1.1', false],
    ['172.32.0.1', false], // outside 172.16/12
    ['172.15.255.255', false],
  ])('isPrivateIpv4(%s) === %s', (ip, expected) => {
    expect(isPrivateIpv4(ip)).toBe(expected)
  })
})

describe('isPrivateIpv6', () => {
  it.each([
    ['::1', true], // loopback
    ['fe80::1', true], // link-local
    ['fc00::1', true], // unique local
    ['fd12:3456:789a::1', true], // unique local
    ['ff02::1', true], // multicast
    ['::ffff:192.168.1.1', true], // IPv4-mapped private
    ['::ffff:8.8.8.8', false], // IPv4-mapped public
    ['2001:db8::1', false], // documentation range — not blocked here
    ['2606:4700:4700::1111', false], // public (Cloudflare)
  ])('isPrivateIpv6(%s) === %s', (ip, expected) => {
    expect(isPrivateIpv6(ip)).toBe(expected)
  })
})

describe('isPrivateIp', () => {
  it('combines v4 + v6', () => {
    expect(isPrivateIp('127.0.0.1')).toBe(true)
    expect(isPrivateIp('::1')).toBe(true)
    expect(isPrivateIp('1.1.1.1')).toBe(false)
  })
  it('returns false for non-IP', () => {
    expect(isPrivateIp('example.com')).toBe(false)
  })
})
