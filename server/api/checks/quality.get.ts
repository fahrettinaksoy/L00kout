import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

interface LighthouseScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

const tryPageSpeed = async (url: string, apiKey?: string) => {
  const params = new URLSearchParams({
    url,
    strategy: 'mobile',
    category: 'performance',
  })
  for (const cat of ['accessibility', 'best-practices', 'seo']) params.append('category', cat)
  if (apiKey) params.set('key', apiKey)

  const res = await fetchWithTimeout(
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
    {},
    45000,
  )

  if (!res.ok) return { ok: false as const, status: res.status }
  const data = (await res.json()) as any
  const cats = data?.lighthouseResult?.categories ?? {}
  const scores: LighthouseScores = {
    performance: Math.round((cats.performance?.score ?? 0) * 100),
    accessibility: Math.round((cats.accessibility?.score ?? 0) * 100),
    bestPractices: Math.round((cats['best-practices']?.score ?? 0) * 100),
    seo: Math.round((cats.seo?.score ?? 0) * 100),
  }
  return {
    ok: true as const,
    scores,
    metrics: data?.lighthouseResult?.audits?.metrics?.details?.items?.[0] ?? null,
  }
}

const fetchObservatory = async (hostname: string): Promise<any | null> => {
  try {
    const res = await fetchWithTimeout(
      `https://observatory-api.mdn.mozilla.net/api/v2/scan?host=${encodeURIComponent(hostname)}`,
      { method: 'POST' },
      12000,
    )
    if (!res.ok) return null
    const data = (await res.json()) as any
    if (!data || data.error) return null
    return data
  } catch {
    return null
  }
}

export default defineCheck({
  id: 'quality',
  handler: async ({ target }) => {
    const apiKey = process.env.PAGESPEED_API_KEY

    // 1) Try PageSpeed (Lighthouse)
    const ps = await tryPageSpeed(target.url, apiKey)
    if (ps.ok) {
      return { available: true, source: 'lighthouse', ...ps }
    }

    // 2) Fallback: Mozilla Observatory (security grade)
    const obs = await fetchObservatory(target.hostname)
    if (obs && typeof obs.score === 'number') {
      return {
        available: true,
        source: 'mozilla-observatory',
        observatory: {
          grade: obs.grade,
          score: obs.score,
          testsPassed: obs.tests_passed,
          testsFailed: obs.tests_failed,
          testsQuantity: obs.tests_quantity,
          detailsUrl: obs.details_url,
        },
        hint: 'PageSpeed unavailable, showing Mozilla Observatory security grade',
      }
    }

    // 3) Nothing worked
    let hint = 'PageSpeed Insights API failed'
    if (ps.status === 429) hint = 'PageSpeed rate limit. Set PAGESPEED_API_KEY for higher quota.'
    else if (ps.status === 403) hint = 'API key invalid or quota exceeded.'
    else if (ps.status === 400) hint = 'PageSpeed could not analyze this URL.'
    return {
      available: false,
      status: ps.status,
      hint,
      hasKey: !!apiKey,
    }
  },
})
