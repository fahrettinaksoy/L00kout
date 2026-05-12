import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const queryDoh = async (name: string, type: string) => {
  try {
    const res = await fetchWithTimeout(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}&do=1`,
      { headers: { Accept: 'application/dns-json' } },
      5000,
    )
    if (!res.ok) return null
    return (await res.json()) as any
  } catch {
    return null
  }
}

const flags = (data: any) => ({
  rd: !!data?.RD,
  ra: !!data?.RA,
  tc: !!data?.TC,
  ad: !!data?.AD,
  cd: !!data?.CD,
})

export default defineCheck({
  id: 'dnssec',
  handler: async ({ target }) => {
    const out: Record<string, any> = {}
    for (const type of ['DNSKEY', 'DS', 'RRSIG'] as const) {
      const data = await queryDoh(target.hostname, type)
      out[type] = {
        present: !!data?.Answer?.length,
        flags: data ? flags(data) : { rd: false, ra: false, tc: false, ad: false, cd: false },
        records: data?.Answer ?? [],
      }
    }
    const enabled = Object.values(out).some((v: any) => v.present)
    return { enabled, sections: out }
  },
})
