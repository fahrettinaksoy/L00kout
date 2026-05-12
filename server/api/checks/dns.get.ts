import { promises as dns } from 'node:dns'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { classifyTxt, type TxtRecordKind } from '../../utils/dns'

const RECORD_TYPES = ['A', 'AAAA', 'MX', 'NS', 'CNAME', 'SOA', 'TXT', 'SRV'] as const
const DOH_PROBE_LIMIT = 3
const DOH_TIMEOUT_MS = 3_500

export default defineCheck({
  id: 'dns',
  // No SSRF guard: DNS resolution itself is the point and we never fetch
  // attacker-controlled URLs except DoH endpoints on the NS records, which
  // we restrict via timeout + small probe count.
  handler: async ({ target }) => {
    const records: Record<string, unknown> = {}
    await Promise.all(
      RECORD_TYPES.map(async (type) => {
        try {
          records[type] = await dns.resolve(target.hostname, type)
        } catch {
          records[type] = []
        }
      }),
    )

    const txtFlat: string[] = Array.isArray(records.TXT)
      ? (records.TXT as string[][]).map((t) => (Array.isArray(t) ? t.join('') : String(t)))
      : []
    const txtClassified: Record<TxtRecordKind, string[]> = {
      spf: [],
      dmarc: [],
      dkim: [],
      bimi: [],
      verification: [],
      other: [],
    }
    for (const rec of txtFlat) {
      txtClassified[classifyTxt(rec)].push(rec)
    }

    const nameServers: string[] = Array.isArray(records.NS) ? (records.NS as string[]) : []
    const dohSupport: Record<string, boolean> = {}
    await Promise.all(
      nameServers.slice(0, DOH_PROBE_LIMIT).map(async (ns) => {
        try {
          const res = await fetchWithTimeout(
            `https://${ns}/dns-query?name=${encodeURIComponent(target.hostname)}&type=A`,
            { headers: { Accept: 'application/dns-json' } },
            DOH_TIMEOUT_MS,
          )
          dohSupport[ns] = res.ok
        } catch {
          dohSupport[ns] = false
        }
      }),
    )

    return {
      records,
      txt: { all: txtFlat, classified: txtClassified },
      nameServers,
      dohSupport,
    }
  },
})
