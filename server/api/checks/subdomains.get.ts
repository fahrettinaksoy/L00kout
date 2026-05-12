import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const fromCrtSh = async (host: string): Promise<string[]> => {
  try {
    const res = await fetchWithTimeout(
      `https://crt.sh/?q=%25.${encodeURIComponent(host)}&output=json`,
      {},
      12000,
    )
    if (!res.ok) return []
    const data = (await res.json()) as any[]
    const set = new Set<string>()
    for (const entry of data) {
      const names = String(entry.name_value ?? '').split(/\r?\n/)
      for (const n of names) {
        const name = n.trim().toLowerCase()
        if (
          name &&
          !name.startsWith('*.') &&
          name.endsWith(host.toLowerCase()) &&
          name !== host.toLowerCase()
        ) {
          set.add(name)
        }
      }
    }
    return Array.from(set)
  } catch {
    return []
  }
}

const fromHackertarget = async (host: string): Promise<string[]> => {
  try {
    const res = await fetchWithTimeout(
      `https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(host)}`,
      {},
      8000,
    )
    if (!res.ok) return []
    const text = await res.text()
    if (text.includes('API count exceeded') || text.startsWith('error')) return []
    const set = new Set<string>()
    for (const line of text.split('\n')) {
      const name = line.split(',')[0]?.trim().toLowerCase()
      if (name && name.endsWith(host.toLowerCase()) && name !== host.toLowerCase()) {
        set.add(name)
      }
    }
    return Array.from(set)
  } catch {
    return []
  }
}

export default defineCheck({
  id: 'subdomains',
  handler: async ({ target }) => {
    if (target.isIp) return { base: target.hostname, total: 0, subdomains: [], sources: [] }

    const [crt, ht] = await Promise.all([
      fromCrtSh(target.hostname),
      fromHackertarget(target.hostname),
    ])

    const set = new Set<string>([...crt, ...ht])
    const all = Array.from(set).sort()
    const sources: string[] = []
    if (crt.length) sources.push('crt.sh')
    if (ht.length) sources.push('hackertarget.com')

    return {
      base: target.hostname,
      total: all.length,
      subdomains: all.slice(0, 100),
      truncated: all.length > 100,
      sources,
    }
  },
})
