import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'security-txt',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const candidates = [
      `https://${target.hostname}/.well-known/security.txt`,
      `https://${target.hostname}/security.txt`,
    ]
    for (const url of candidates) {
      try {
        const res = await fetchWithTimeout(url, {}, 6000)
        if (!res.ok) continue
        const text = await res.text()
        if (!text.toLowerCase().includes('contact:')) continue
        const fields: Record<string, string[]> = {}
        for (const line of text.split(/\r?\n/)) {
          const m = /^([A-Za-z-]+):\s*(.+)$/.exec(line)
          if (!m || !m[1] || !m[2]) continue
          const k = m[1].toLowerCase()
          fields[k] = fields[k] || []
          fields[k]!.push(m[2].trim())
        }
        return { found: true, source: url, fields, raw: text.slice(0, 2000) }
      } catch {}
    }
    return { found: false }
  },
})
