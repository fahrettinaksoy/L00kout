import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'archives',
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(
      `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(target.hostname)}&output=json&limit=20&from=2000`,
      {},
      12000,
    )
    if (!res.ok) return { found: false, snapshots: [] }
    const data = (await res.json()) as string[][]
    const [head, ...rows] = data
    if (!head) return { found: false, snapshots: [] }
    const snapshots = rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])))
    return {
      found: snapshots.length > 0,
      total: snapshots.length,
      first: snapshots[0]?.timestamp,
      last: snapshots[snapshots.length - 1]?.timestamp,
      snapshots: snapshots.slice(0, 20),
    }
  },
})
