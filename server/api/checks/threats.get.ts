import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'threats',
  handler: async ({ target }) => {
    const checks = await Promise.allSettled([
      fetchWithTimeout(
        `https://urlhaus-api.abuse.ch/v1/host/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `host=${encodeURIComponent(target.hostname)}`,
        },
        8000,
      ).then((r) => r.json()),
      fetchWithTimeout(
        `https://phish.report/api/v0/check?url=${encodeURIComponent(target.url)}`,
        {},
        6000,
      )
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ])
    const urlhaus = checks[0].status === 'fulfilled' ? checks[0].value : null
    const phishReport = checks[1].status === 'fulfilled' ? checks[1].value : null
    return {
      urlhaus: (urlhaus as any)?.query_status === 'ok' ? urlhaus : { listed: false },
      phishReport,
    }
  },
})
