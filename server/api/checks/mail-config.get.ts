import { promises as dns } from 'node:dns'
import { defineCheck } from '../../utils/defineCheck'

export default defineCheck({
  id: 'mail-config',
  handler: async ({ target }) => {
    const out: any = { spf: null, dmarc: null, dkim: null, mx: [] }

    try {
      out.mx = await dns.resolveMx(target.hostname)
    } catch {}

    try {
      const txt = await dns.resolveTxt(target.hostname)
      out.spf = txt.map((t) => t.join('')).find((r) => r.toLowerCase().startsWith('v=spf1')) ?? null
    } catch {}

    try {
      const dmarc = await dns.resolveTxt(`_dmarc.${target.hostname}`)
      out.dmarc =
        dmarc.map((t) => t.join('')).find((r) => r.toLowerCase().startsWith('v=dmarc1')) ?? null
    } catch {}

    for (const selector of ['default', 'google', 'k1', 'mail', 'selector1']) {
      try {
        const dkim = await dns.resolveTxt(`${selector}._domainkey.${target.hostname}`)
        const found = dkim.map((t) => t.join('')).find((r) => r.toLowerCase().includes('v=dkim'))
        if (found) {
          out.dkim = { selector, record: found }
          break
        }
      } catch {}
    }

    out.score = (out.spf ? 1 : 0) + (out.dmarc ? 1 : 0) + (out.dkim ? 1 : 0)
    return out
  },
})
