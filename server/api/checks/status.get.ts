import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'status',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const start = Date.now()
    const res = await fetchWithTimeout(target.url, { method: 'HEAD', redirect: 'follow' }, 8000)
    return {
      online: res.ok,
      statusCode: res.status,
      statusText: res.statusText,
      responseTimeMs: Date.now() - start,
      finalUrl: res.url,
    }
  },
})
