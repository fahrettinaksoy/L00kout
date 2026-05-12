import * as cheerio from 'cheerio'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'

export default defineCheck({
  id: 'linked-pages',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, {}, 10000)
    if (!res.ok)
      throw new AppError('UPSTREAM_HTTP_ERROR', 502, { url: target.url, status: res.status })
    const html = await res.text()
    const $ = cheerio.load(html)
    const internal = new Set<string>()
    const external = new Set<string>()
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('javascript:')
      )
        return
      try {
        const abs = new URL(href, target.url)
        if (abs.hostname === target.hostname) internal.add(abs.toString())
        else external.add(abs.toString())
      } catch {}
    })
    return {
      internalCount: internal.size,
      externalCount: external.size,
      internal: [...internal].slice(0, 50),
      external: [...external].slice(0, 50),
    }
  },
})
