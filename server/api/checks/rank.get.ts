import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'rank',
  handler: async ({ target }) => {
    try {
      const res = await fetchWithTimeout(
        `https://tranco-list.eu/api/ranks/domain/${target.hostname}`,
        {},
        8000,
      )
      if (!res.ok) return { ranked: false }
      const data = (await res.json()) as any
      const ranks = data?.ranks ?? []
      const latest = ranks[0]
      return {
        ranked: !!latest,
        rank: latest?.rank ?? null,
        date: latest?.date ?? null,
        history: ranks.slice(0, 12),
      }
    } catch {
      return { ranked: false }
    }
  },
})
