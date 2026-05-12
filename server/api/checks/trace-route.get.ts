import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { defineCheck } from '../../utils/defineCheck'

const execP = promisify(exec)

export default defineCheck({
  id: 'trace-route',
  handler: async ({ target }) => {
    const cmd =
      process.platform === 'win32'
        ? `tracert -d -h 20 -w 2000 ${target.hostname}`
        : `traceroute -n -m 20 -w 2 ${target.hostname}`
    try {
      const { stdout } = await execP(cmd, { timeout: 30000, maxBuffer: 1024 * 1024 })
      const hops = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^\d/.test(line))
        .map((line) => {
          const [hop, ...rest] = line.split(/\s+/)
          return { hop: Number(hop), raw: rest.join(' ') }
        })
      return { available: true, hops, raw: stdout }
    } catch (e: unknown) {
      return { available: false, error: e instanceof Error ? e.message : String(e) }
    }
  },
})
