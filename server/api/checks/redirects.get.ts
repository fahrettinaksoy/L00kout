import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'redirects',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const chain: { url: string; status: number; location: string | null }[] = []
    let url = target.url
    for (let i = 0; i < 10; i++) {
      try {
        const res = await fetchWithTimeout(url, { redirect: 'manual', method: 'GET' }, 8000)
        const loc = res.headers.get('location')
        chain.push({ url, status: res.status, location: loc })
        if (res.status >= 300 && res.status < 400 && loc) {
          url = new URL(loc, url).toString()
        } else break
      } catch (e: unknown) {
        chain.push({ url, status: 0, location: e instanceof Error ? e.message : String(e) })
        break
      }
    }
    return { count: chain.length - 1, finalUrl: chain[chain.length - 1]?.url, chain }
  },
})
