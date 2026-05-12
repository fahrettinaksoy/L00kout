/**
 * SSRF protection. Resolves a hostname and rejects targets that point to
 * private, loopback, link-local, multicast, or reserved address space —
 * including cloud metadata endpoints (169.254.169.254, fd00:ec2::254).
 *
 * Use `assertPublicTarget(hostname)` before performing any outbound HTTP
 * request to a user-controlled host.
 */

import { promises as dns } from 'node:dns'
import { isIpv4, isIpv6 } from '../../shared/url'
import { AppError } from './errors'

interface CidrRule {
  network: bigint
  prefix: number
}

const ipv4ToBigInt = (ip: string): bigint => {
  const parts = ip.split('.').map(Number)
  return (
    (BigInt(parts[0]!) << 24n) |
    (BigInt(parts[1]!) << 16n) |
    (BigInt(parts[2]!) << 8n) |
    BigInt(parts[3]!)
  )
}

const expandIpv6 = (ip: string): bigint => {
  let normalised = ip.toLowerCase()
  if (normalised.includes('::')) {
    const [head, tail] = normalised.split('::')
    const headParts = head ? head.split(':') : []
    const tailParts = tail ? tail.split(':') : []
    const missing = 8 - headParts.length - tailParts.length
    normalised = [...headParts, ...Array(missing).fill('0'), ...tailParts].join(':')
  }
  return normalised
    .split(':')
    .reduce((acc, part) => (acc << 16n) | BigInt(parseInt(part || '0', 16)), 0n)
}

const cidr = (network: bigint, prefix: number): CidrRule => ({ network, prefix })

const matchesCidr = (ip: bigint, rule: CidrRule, totalBits: 32 | 128): boolean => {
  const shift = BigInt(totalBits - rule.prefix)
  return ip >> shift === rule.network >> shift
}

// RFC 1918, RFC 6890, IANA special-purpose
const IPV4_BLOCKED: CidrRule[] = [
  cidr(ipv4ToBigInt('0.0.0.0'), 8), // "this network"
  cidr(ipv4ToBigInt('10.0.0.0'), 8), // private
  cidr(ipv4ToBigInt('100.64.0.0'), 10), // CGNAT
  cidr(ipv4ToBigInt('127.0.0.0'), 8), // loopback
  cidr(ipv4ToBigInt('169.254.0.0'), 16), // link-local + AWS metadata
  cidr(ipv4ToBigInt('172.16.0.0'), 12), // private
  cidr(ipv4ToBigInt('192.0.0.0'), 24), // IETF protocol
  cidr(ipv4ToBigInt('192.0.2.0'), 24), // TEST-NET-1
  cidr(ipv4ToBigInt('192.168.0.0'), 16), // private
  cidr(ipv4ToBigInt('198.18.0.0'), 15), // benchmark
  cidr(ipv4ToBigInt('198.51.100.0'), 24), // TEST-NET-2
  cidr(ipv4ToBigInt('203.0.113.0'), 24), // TEST-NET-3
  cidr(ipv4ToBigInt('224.0.0.0'), 4), // multicast
  cidr(ipv4ToBigInt('240.0.0.0'), 4), // reserved
  cidr(ipv4ToBigInt('255.255.255.255'), 32), // broadcast
]

const IPV6_BLOCKED: CidrRule[] = [
  cidr(expandIpv6('::'), 128), // unspecified
  cidr(expandIpv6('::1'), 128), // loopback
  cidr(expandIpv6('::ffff:0:0'), 96), // IPv4-mapped (handled separately too)
  cidr(expandIpv6('64:ff9b::'), 96), // NAT64
  cidr(expandIpv6('100::'), 64), // discard
  cidr(expandIpv6('fc00::'), 7), // unique local
  cidr(expandIpv6('fe80::'), 10), // link-local
  cidr(expandIpv6('ff00::'), 8), // multicast
]

export const isPrivateIpv4 = (ip: string): boolean => {
  if (!isIpv4(ip)) return false
  const v = ipv4ToBigInt(ip)
  return IPV4_BLOCKED.some((rule) => matchesCidr(v, rule, 32))
}

export const isPrivateIpv6 = (ip: string): boolean => {
  // IPv4-mapped form (::ffff:1.2.3.4) is technically a v6 representation
  // of a v4 address; defer to the v4 logic on the embedded address.
  if (ip.toLowerCase().startsWith('::ffff:') && ip.includes('.')) {
    const v4 = ip.split(':').pop() ?? ''
    return isPrivateIpv4(v4)
  }
  if (!isIpv6(ip)) return false
  const v = expandIpv6(ip)
  return IPV6_BLOCKED.some((rule) => matchesCidr(v, rule, 128))
}

export const isPrivateIp = (ip: string): boolean => isPrivateIpv4(ip) || isPrivateIpv6(ip)

const FORBIDDEN_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata.goog',
])

/**
 * Resolves the hostname and throws AppError('SSRF_BLOCKED') if any resolved
 * address falls into reserved, private, or metadata IP space.
 *
 * Returns the resolved IPv4/IPv6 addresses so callers can reuse them.
 */
export const assertPublicTarget = async (
  hostname: string,
): Promise<{ ipv4: string[]; ipv6: string[] }> => {
  const lower = hostname.toLowerCase()
  if (FORBIDDEN_HOSTNAMES.has(lower)) {
    throw new AppError('SSRF_BLOCKED', 400, { hostname })
  }

  if (isIpv4(hostname) || isIpv6(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AppError('SSRF_BLOCKED', 400, { hostname })
    }
    return isIpv4(hostname) ? { ipv4: [hostname], ipv6: [] } : { ipv4: [], ipv6: [hostname] }
  }

  const [ipv4, ipv6] = await Promise.all([
    dns.resolve4(hostname).catch(() => [] as string[]),
    dns.resolve6(hostname).catch(() => [] as string[]),
  ])

  if (ipv4.length === 0 && ipv6.length === 0) {
    throw new AppError('DNS_RESOLUTION_FAILED', 502, { hostname })
  }

  const offender = [...ipv4, ...ipv6].find(isPrivateIp)
  if (offender) {
    throw new AppError('SSRF_BLOCKED', 400, { hostname, address: offender })
  }

  return { ipv4, ipv6 }
}
