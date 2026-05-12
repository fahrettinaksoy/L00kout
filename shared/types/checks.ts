/**
 * Public response shapes for each check endpoint.
 *
 * Keep this in sync with `server/api/checks/*.get.ts` return types.
 * Renderer components consume these via `defineProps<{ data: SslData }>()`
 * so we get autocomplete + type-checking in templates.
 *
 * If you only need rough typing in a renderer (e.g. an unmapped check),
 * use `GenericCheckData` and accept `Record<string, unknown>`.
 */

export type GenericCheckData = Record<string, unknown>

/** http-security.get.ts */
export interface HttpSecurityData {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  present: number
  total: number
  checks: Record<string, { present: boolean; value: string | null }>
  hsts: {
    enabled: boolean
    maxAgeSeconds: number | null
    includesSubdomains: boolean
    preload: boolean
    header: string | null
  }
}

/** ssl.get.ts */
export interface SslData {
  subject: { CN?: string; O?: string; [k: string]: string | undefined }
  issuer: { CN?: string; O?: string; [k: string]: string | undefined }
  validFrom: string
  validTo: string
  daysRemaining: number
  trusted: boolean
  serialNumber: string
  fingerprint256: string
  altNames: string[]
  signatureAlgorithm: string | null
  keyAlgorithm: string | null
  keyBits: number | null
  asn1Curve: string | null
  nistCurve: string | null
  extKeyUsage: string[]
  protocol: string | null
  cipher: string | null
  cipherStandard: string | null
  cipherVersion: string | null
  alpnProtocol: string | null
  forwardSecrecy: boolean
  sessionResumption: boolean
  ocspStapling: boolean
  ephemeralKey: { type?: string; name?: string; size?: number } | null
  labs?: { grade: string | null; status: string | null } | null
}

/** dns.get.ts — note: TxtRecordKind lives in server/utils/dns.ts (single source) */
export interface DnsData {
  records: Record<string, unknown>
  txt: {
    all: string[]
    classified: Record<'spf' | 'dmarc' | 'dkim' | 'bimi' | 'verification' | 'other', string[]>
  }
  nameServers: string[]
  dohSupport: Record<string, boolean>
}

/** location.get.ts */
export interface LocationData {
  ip: string
  ipv4: string[]
  ipv6: string[]
  country: string | null
  countryCode: string | null
  city: string | null
  region: string | null
  postal: string | null
  org: string | null
  isp: string | null
  asn: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
  languages: string[]
  currency: { code: string | null; name: string | null }
}

/** whois.get.ts */
export interface WhoisData {
  domain: string
  registrar: string | null
  registrarUrl: string | null
  registrarIanaId: string | null
  registrarWhois: string | null
  created: string | null
  updated: string | null
  expires: string | null
  status: string[]
  nameServers: string[]
  dnssec: string | null
  registryId: string | null
}

/** malware.get.ts */
export interface MalwareData {
  available: boolean
  clean: boolean
  threats: Array<{
    source: string
    threatType: string
    platformType: string | null
  }>
  sources: string[]
}
