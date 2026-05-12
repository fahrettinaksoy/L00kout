/**
 * Shared URL/target parsing used by both client and server.
 * Single source of truth — do not duplicate this logic elsewhere.
 */

export interface TargetInfo {
  raw: string
  hostname: string
  url: string
  isIp: boolean
  isIpv4: boolean
  isIpv6: boolean
}

const IPV4_OCTET = '(25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)'
const IPV4_PATTERN = new RegExp(`^${IPV4_OCTET}(\\.${IPV4_OCTET}){3}$`)
const IPV6_PATTERN = /^(?:[0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/

const HOSTNAME_MAX_LENGTH = 253
const HOSTNAME_LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i

export const isIpv4 = (value: string): boolean => IPV4_PATTERN.test(value)
export const isIpv6 = (value: string): boolean => IPV6_PATTERN.test(value) && value.includes(':')
export const isIp = (value: string): boolean => isIpv4(value) || isIpv6(value)

const stripIpv6Brackets = (hostname: string): string =>
  hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname

const isValidHostname = (hostname: string): boolean => {
  if (!hostname || hostname.length > HOSTNAME_MAX_LENGTH) return false
  if (isIp(stripIpv6Brackets(hostname))) return true
  if (!hostname.includes('.')) return false
  return hostname.split('.').every((label) => HOSTNAME_LABEL_PATTERN.test(label))
}

export const parseTarget = (input: unknown): TargetInfo | null => {
  if (typeof input !== 'string') return null
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const hostname = stripIpv6Brackets(url.hostname.toLowerCase())
  if (!isValidHostname(hostname)) return null

  const v4 = isIpv4(hostname)
  const v6 = isIpv6(hostname)

  return {
    raw: trimmed,
    hostname,
    url: url.toString(),
    isIp: v4 || v6,
    isIpv4: v4,
    isIpv6: v6,
  }
}
