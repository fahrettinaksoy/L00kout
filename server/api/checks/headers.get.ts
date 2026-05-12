import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'headers',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, { method: 'GET', redirect: 'follow' }, 10000)
    const headers: Record<string, string> = {}
    res.headers.forEach((v, k) => {
      headers[k] = v
    })
    return { status: res.status, finalUrl: res.url, headers }
  },
})
