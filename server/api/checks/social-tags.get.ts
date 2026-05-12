import * as cheerio from 'cheerio'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'

export default defineCheck({
  id: 'social-tags',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, {}, 10000)
    if (!res.ok)
      throw new AppError('UPSTREAM_HTTP_ERROR', 502, { url: target.url, status: res.status })
    const html = await res.text()
    const $ = cheerio.load(html)
    const og: Record<string, string> = {}
    const twitter: Record<string, string> = {}
    const meta: Record<string, string> = {}
    $('meta').each((_, el) => {
      const name = $(el).attr('property') || $(el).attr('name')
      const content = $(el).attr('content')
      if (!name || !content) return
      if (name.startsWith('og:')) og[name.slice(3)] = content
      else if (name.startsWith('twitter:')) twitter[name.slice(8)] = content
      else meta[name] = content
    })
    const canonical = $('link[rel="canonical"]').attr('href') ?? null
    return {
      title: $('title').first().text(),
      description: meta.description ?? null,
      canonical,
      og,
      twitter,
    }
  },
})
