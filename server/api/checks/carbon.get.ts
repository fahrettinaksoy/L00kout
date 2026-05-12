import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const ENERGY_PER_BYTE_KWH = 0.000_000_000_872 // research average
const CO2_GRID_G_PER_KWH = 442 // global average grid intensity
const CO2_RENEWABLE_G_PER_KWH = 50

const estimate = (bytes: number, green: boolean) => {
  const energy = bytes * ENERGY_PER_BYTE_KWH
  const gridG = energy * CO2_GRID_G_PER_KWH
  const renewableG = energy * CO2_RENEWABLE_G_PER_KWH
  return {
    bytes,
    green,
    cleanerThan: null,
    statistics: {
      adjustedBytes: bytes * 0.75,
      energy,
      co2: {
        grid: { grams: gridG, litres: gridG * 0.5 },
        renewable: { grams: renewableG, litres: renewableG * 0.5 },
      },
    },
  }
}

const measureBytes = async (url: string): Promise<number | null> => {
  try {
    const res = await fetchWithTimeout(url, { redirect: 'follow' }, 10000)
    const ct = res.headers.get('content-length')
    if (ct) return Number(ct)
    const body = await res.text()
    return body.length
  } catch {
    return null
  }
}

export default defineCheck({
  id: 'carbon',
  ssrfGuard: true,
  handler: async ({ target }) => {
    // Try official API first (it's free but flaky)
    try {
      const res = await fetchWithTimeout(
        `https://api.websitecarbon.com/site?url=${encodeURIComponent(target.url)}`,
        {},
        8000,
      )
      if (res.ok) {
        const data = (await res.json()) as any
        return { ...data, source: 'websitecarbon.com' }
      }
    } catch {}

    // Fallback: measure ourselves
    const bytes = await measureBytes(target.url)
    if (!bytes) return { available: false }
    return { ...estimate(bytes, false), source: 'local-estimate' }
  },
})
