// @ts-ignore - xml2js has no bundled type declarations
import { parseStringPromise } from 'xml2js'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const tryUrls = (host: string) => [
  `https://${host}/sitemap.xml`,
  `https://${host}/sitemap_index.xml`,
  `https://${host}/sitemap-index.xml`,
]

interface SitemapUrl {
  loc: string
  lastmod?: string | null
  changefreq?: string | null
  priority?: string | null
}

const normalize = (entry: any): SitemapUrl => ({
  loc: typeof entry === 'string' ? entry : (entry?.loc ?? ''),
  lastmod: entry?.lastmod ?? null,
  changefreq: entry?.changefreq ?? null,
  priority: entry?.priority ?? null,
})

export default defineCheck({
  id: 'sitemap',
  ssrfGuard: true,
  handler: async ({ target }) => {
    for (const url of tryUrls(target.hostname)) {
      try {
        const res = await fetchWithTimeout(url, {}, 8000)
        if (!res.ok) continue
        const xml = await res.text()
        const parsed = await parseStringPromise(xml, { explicitArray: false }).catch(() => null)
        const urlset = parsed?.urlset?.url
        const sitemapindex = parsed?.sitemapindex?.sitemap
        const urls: SitemapUrl[] = urlset
          ? (Array.isArray(urlset) ? urlset : [urlset]).map(normalize)
          : []
        const indexes = sitemapindex
          ? (Array.isArray(sitemapindex) ? sitemapindex : [sitemapindex]).map(normalize)
          : []
        return {
          found: true,
          source: url,
          urlCount: urls.length,
          indexCount: indexes.length,
          sample: urls.slice(0, 40),
          indexes: indexes.slice(0, 20),
        }
      } catch {}
    }
    return { found: false }
  },
})
