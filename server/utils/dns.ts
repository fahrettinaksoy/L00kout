/**
 * DNS-related pure helpers (classification, parsing). Side-effecting DNS
 * queries live in the endpoint handlers; everything here is testable.
 */

export type TxtRecordKind = 'spf' | 'dmarc' | 'dkim' | 'bimi' | 'verification' | 'other'

const VERIFICATION_PATTERNS: RegExp[] = [
  /google-site-verification/i,
  /^ms=/i,
  /-domain-verification=/i,
  /^facebook-domain-verification=/i,
  /^apple-domain-verification=/i,
]

export const classifyTxt = (record: string): TxtRecordKind => {
  const r = record.trim().toLowerCase()
  if (r.startsWith('v=spf1')) return 'spf'
  if (r.startsWith('v=dmarc1')) return 'dmarc'
  if (r.startsWith('v=dkim1')) return 'dkim'
  if (r.startsWith('v=bimi1')) return 'bimi'
  if (VERIFICATION_PATTERNS.some((rx) => rx.test(r))) return 'verification'
  return 'other'
}
