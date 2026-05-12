import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'robots-txt',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const url = `https://${target.hostname}/robots.txt`
    const res = await fetchWithTimeout(url, {}, 8000)
    if (!res.ok) return { exists: false, status: res.status }
    const text = await res.text()
    const lines = text.split(/\r?\n/)
    const allow: string[] = []
    const disallow: string[] = []
    const sitemaps: string[] = []
    for (const l of lines) {
      const m = /^\s*(allow|disallow|sitemap)\s*:\s*(.+?)\s*$/i.exec(l)
      if (!m || !m[1] || !m[2]) continue
      const k = m[1].toLowerCase()
      if (k === 'allow') allow.push(m[2])
      else if (k === 'disallow') disallow.push(m[2])
      else if (k === 'sitemap') sitemaps.push(m[2])
    }
    return { exists: true, size: text.length, allow, disallow, sitemaps, raw: text.slice(0, 4000) }
  },
})
