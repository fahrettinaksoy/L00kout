/**
 * HTTP security header helpers. Pure parsing only — no fetch logic.
 */

export const SECURITY_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'cross-origin-embedder-policy',
] as const

export type SecurityHeaderName = (typeof SECURITY_HEADERS)[number]

export interface HstsDetail {
  enabled: boolean
  maxAgeSeconds: number | null
  includesSubdomains: boolean
  preload: boolean
  header: string | null
}

export const parseHsts = (header: string | null): HstsDetail => {
  if (!header) {
    return {
      enabled: false,
      maxAgeSeconds: null,
      includesSubdomains: false,
      preload: false,
      header: null,
    }
  }
  const maxAge = /max-age\s*=\s*"?(\d+)"?/i.exec(header)?.[1]
  return {
    enabled: true,
    maxAgeSeconds: maxAge ? Number(maxAge) : null,
    includesSubdomains: /includeSubDomains/i.test(header),
    preload: /preload/i.test(header),
    header,
  }
}
