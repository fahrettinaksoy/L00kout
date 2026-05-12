import { Resolver } from 'node:dns/promises'
import { defineCheck } from '../../utils/defineCheck'

const BLOCKLIST_RESOLVERS: { name: string; servers: string[] }[] = [
  { name: 'AdGuard', servers: ['94.140.14.14', '94.140.15.15'] },
  { name: 'AdGuard Family', servers: ['94.140.14.15', '94.140.15.16'] },
  { name: 'CleanBrowsing Adult', servers: ['185.228.168.10', '185.228.169.11'] },
  { name: 'CleanBrowsing Family', servers: ['185.228.168.168', '185.228.169.168'] },
  { name: 'CleanBrowsing Security', servers: ['185.228.168.9', '185.228.169.9'] },
  { name: 'Cloudflare', servers: ['1.1.1.2', '1.0.0.2'] },
  { name: 'Cloudflare Family', servers: ['1.1.1.3', '1.0.0.3'] },
  { name: 'Comodo Secure', servers: ['8.26.56.26', '8.20.247.20'] },
  { name: 'Google DNS', servers: ['8.8.8.8', '8.8.4.4'] },
  { name: 'OpenDNS', servers: ['208.67.222.222', '208.67.220.220'] },
  { name: 'OpenDNS Family', servers: ['208.67.222.123', '208.67.220.123'] },
  { name: 'Quad9', servers: ['9.9.9.9', '149.112.112.112'] },
]

const HARD_TIMEOUT = 4000

const withTimeout = <T>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
  new Promise<T>((resolve) => {
    let done = false
    const timer = setTimeout(() => {
      if (!done) {
        done = true
        resolve(fallback)
      }
    }, ms)
    p.then((v) => {
      if (!done) {
        done = true
        clearTimeout(timer)
        resolve(v)
      }
    }).catch(() => {
      if (!done) {
        done = true
        clearTimeout(timer)
        resolve(fallback)
      }
    })
  })

export default defineCheck({
  id: 'block-lists',
  handler: async ({ target }) => {
    const results = await Promise.all(
      BLOCKLIST_RESOLVERS.map(async (bl) => {
        const r = new Resolver({ timeout: 2500, tries: 1 })
        r.setServers(bl.servers)
        const fallback = { name: bl.name, blocked: false, ips: [] as string[], timedOut: true }
        return withTimeout(
          (async () => {
            try {
              const ips = await r.resolve4(target.hostname)
              const blocked =
                ips.length === 0 || ips.some((ip) => ip === '0.0.0.0' || ip.startsWith('127.'))
              return { name: bl.name, blocked, ips, timedOut: false }
            } catch (e: unknown) {
              const code = (e as { code?: string })?.code ?? ''
              const blocked = code === 'ENOTFOUND' || code === 'ENODATA' || code === 'NXDOMAIN'
              return { name: bl.name, blocked, ips: [], timedOut: false }
            }
          })(),
          HARD_TIMEOUT,
          fallback,
        )
      }),
    )
    return {
      blockedBy: results.filter((r) => r.blocked).map((r) => r.name),
      safeCount: results.filter((r) => !r.blocked).length,
      totalCount: results.length,
      results,
    }
  },
})
