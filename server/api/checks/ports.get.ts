import net from 'node:net'
import { defineCheck } from '../../utils/defineCheck'

const PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 110, service: 'POP3' },
  { port: 143, service: 'IMAP' },
  { port: 443, service: 'HTTPS' },
  { port: 465, service: 'SMTPS' },
  { port: 587, service: 'Submission' },
  { port: 993, service: 'IMAPS' },
  { port: 995, service: 'POP3S' },
  { port: 3306, service: 'MySQL' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 8443, service: 'HTTPS-Alt' },
]

const probe = (host: string, port: number, timeout = 2500) =>
  new Promise<{ port: number; open: boolean }>((resolve) => {
    const sock = new net.Socket()
    let done = false
    const finish = (open: boolean) => {
      if (done) return
      done = true
      sock.destroy()
      resolve({ port, open })
    }
    sock.setTimeout(timeout)
    sock.once('connect', () => finish(true))
    sock.once('timeout', () => finish(false))
    sock.once('error', () => finish(false))
    sock.connect(port, host)
  })

export default defineCheck({
  id: 'ports',
  handler: async ({ target }) => {
    const results = await Promise.all(
      PORTS.map(async (p) => ({
        ...p,
        ...(await probe(target.hostname, p.port)),
      })),
    )
    return {
      open: results.filter((r) => r.open),
      closed: results.filter((r) => !r.open).length,
      results,
    }
  },
})
