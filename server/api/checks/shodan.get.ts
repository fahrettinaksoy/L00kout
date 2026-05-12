import { promises as dns } from 'node:dns'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const resolveIp = async (hostname: string, isIp: boolean): Promise<string | null> => {
  if (isIp) return hostname
  const [a] = await dns.resolve4(hostname).catch(() => [])
  return a ?? null
}

const fromInternetDb = async (ip: string) => {
  try {
    const res = await fetchWithTimeout(`https://internetdb.shodan.io/${ip}`, {}, 8000)
    if (!res.ok) return null
    const d = (await res.json()) as any
    return {
      available: true,
      source: 'internetdb.shodan.io',
      ip,
      ports: d.ports ?? [],
      hostnames: d.hostnames ?? [],
      tags: d.tags ?? [],
      vulns: d.vulns ?? [],
      cpes: d.cpes ?? [],
    }
  } catch {
    return null
  }
}

const fromShodanFull = async (ip: string, apiKey: string) => {
  try {
    const res = await fetchWithTimeout(
      `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`,
      {},
      12000,
    )
    if (!res.ok) return null
    const d = (await res.json()) as any
    return {
      available: true,
      source: 'shodan.io (full)',
      ip,
      org: d.org,
      isp: d.isp,
      os: d.os,
      ports: d.ports ?? [],
      hostnames: d.hostnames ?? [],
      tags: d.tags ?? [],
      vulns: d.vulns ?? [],
    }
  } catch {
    return null
  }
}

export default defineCheck({
  id: 'shodan',
  handler: async ({ target }) => {
    const ip = await resolveIp(target.hostname, target.isIp)
    if (!ip) return { available: false }

    const apiKey = process.env.SHODAN_API_KEY
    if (apiKey) {
      const full = await fromShodanFull(ip, apiKey)
      if (full) return full
    }

    const idb = await fromInternetDb(ip)
    if (idb) return idb

    return { available: false, ip }
  },
})
