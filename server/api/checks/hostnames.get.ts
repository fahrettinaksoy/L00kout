import { promises as dns } from 'node:dns'
import { defineCheck } from '../../utils/defineCheck'
import { AppError } from '../../utils/errors'

export default defineCheck({
  id: 'hostnames',
  handler: async ({ target }) => {
    let ips: string[] = []
    if (target.isIp) ips = [target.hostname]
    else ips = await dns.resolve4(target.hostname).catch(() => [])

    if (!ips.length) throw new AppError('DNS_RESOLUTION_FAILED', 502, { hostname: target.hostname })

    const entries = await Promise.all(
      ips.map(async (ip) => {
        try {
          const hosts = await dns.reverse(ip)
          return { ip, hosts }
        } catch {
          return { ip, hosts: [] }
        }
      }),
    )

    const allHosts = new Set<string>()
    for (const e of entries) for (const h of e.hosts) allHosts.add(h)

    return {
      domain: target.hostname,
      ips: entries,
      uniqueHostnames: Array.from(allHosts),
    }
  },
})
