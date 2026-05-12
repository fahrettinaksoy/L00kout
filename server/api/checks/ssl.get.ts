import tls from 'node:tls'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'
import { cached, CACHE_TTL } from '../../utils/cache'

interface SslOut {
  subject: { CN?: string; O?: string; [k: string]: string | undefined }
  issuer: { CN?: string; O?: string; [k: string]: string | undefined }
  validFrom: string
  validTo: string
  daysRemaining: number
  trusted: boolean
  serialNumber: string
  fingerprint256: string
  altNames: string[]
  signatureAlgorithm: string | null
  keyAlgorithm: string | null
  keyBits: number | null
  asn1Curve: string | null
  nistCurve: string | null
  extKeyUsage: string[]
  protocol: string | null
  cipher: string | null
  cipherStandard: string | null
  cipherVersion: string | null
  alpnProtocol: string | null
  forwardSecrecy: boolean
  sessionResumption: boolean
  ocspStapling: boolean
  ephemeralKey: { type?: string; name?: string; size?: number } | null
  labs?: { grade: string | null; status: string | null } | null
}

const NIST_CURVE_MAP: Record<string, string> = {
  prime256v1: 'P-256',
  secp256r1: 'P-256',
  secp384r1: 'P-384',
  secp521r1: 'P-521',
}

const EKU_MAP: Record<string, string> = {
  '1.3.6.1.5.5.7.3.1': 'TLS Web Server Authentication',
  '1.3.6.1.5.5.7.3.2': 'TLS Web Client Authentication',
  '1.3.6.1.5.5.7.3.3': 'Code Signing',
  '1.3.6.1.5.5.7.3.4': 'E-mail Protection',
  '1.3.6.1.5.5.7.3.8': 'Time Stamping',
  '1.3.6.1.5.5.7.3.9': 'OCSP Signing',
}

interface HandshakeResult {
  cert: tls.DetailedPeerCertificate
  authorized: boolean
  protocol: string
  cipher: tls.CipherNameAndProtocol | null
  alpn: string | null
  ephemeralKey: { type?: string; name?: string; size?: number } | null
  ocspStapled: boolean
  sessionResumed: boolean
  sessionTicket: unknown
}

const handshake = (
  hostname: string,
  rejectUnauthorized: boolean,
  session?: unknown,
): Promise<HandshakeResult> =>
  new Promise((resolve, reject) => {
    let ocspStapled = false
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized,
        timeout: 10000,
        ALPNProtocols: ['h2', 'http/1.1'],
        session: session as Buffer | undefined,
      } as tls.ConnectionOptions,
      () => {
        const cert = socket.getPeerCertificate(true)
        const protocol = socket.getProtocol() ?? 'unknown'
        const cipher = socket.getCipher() as tls.CipherNameAndProtocol | null
        const authorized = socket.authorized
        const alpn = (socket as any).alpnProtocol ?? null
        const ephemeralKey = (socket as any).getEphemeralKeyInfo?.() ?? null
        const sessionResumed = (socket as any).isSessionReused?.() ?? false
        const sessionTicket = (socket as any).getSession?.()
        socket.end()
        if (!cert || !cert.subject) {
          reject(new Error('No certificate received'))
          return
        }
        resolve({
          cert,
          authorized,
          protocol,
          cipher,
          alpn,
          ephemeralKey,
          ocspStapled,
          sessionResumed,
          sessionTicket,
        })
      },
    )
    socket.on('OCSPResponse', (resp: unknown) => {
      if (resp && (resp as any).length > 0) ocspStapled = true
    })
    socket.on('error', (e: Error) => reject(e))
    socket.on('timeout', () => {
      socket.destroy()
      reject(new Error('TLS handshake timeout'))
    })
  })

const fetchSslLabsRaw = async (hostname: string): Promise<SslOut['labs']> => {
  try {
    const res = await fetchWithTimeout(
      `https://api.ssllabs.com/api/v3/analyze?host=${hostname}&fromCache=on&maxAge=24`,
      {},
      6000,
    )
    if (!res.ok) return null
    const d = (await res.json()) as any
    return { grade: d.endpoints?.[0]?.grade ?? null, status: d.status ?? null }
  } catch {
    return null
  }
}

// SSL Labs results are cached upstream for 24h anyway; mirror that locally.
const fetchSslLabs = (hostname: string) =>
  cached('ssl-labs', [hostname], CACHE_TTL.long, () => fetchSslLabsRaw(hostname))

export default defineCheck({
  id: 'ssl',
  ssrfGuard: true,
  handler: async ({ target }) => {
    let first: HandshakeResult
    try {
      first = await handshake(target.hostname, false)
    } catch (e) {
      throw new AppError('TLS_HANDSHAKE_FAILED', 502, { hostname: target.hostname }, { cause: e })
    }

    // Strict handshake for chain trust verification
    let trusted = first.authorized
    if (!trusted) {
      try {
        await handshake(target.hostname, true)
        trusted = true
      } catch {
        trusted = false
      }
    }

    // Test session resumption with the ticket from first handshake
    let sessionResumption = false
    if (first.sessionTicket) {
      try {
        const second = await handshake(target.hostname, false, first.sessionTicket)
        sessionResumption = second.sessionResumed
      } catch {
        sessionResumption = false
      }
    }

    const cert = first.cert
    const validTo = new Date(cert.valid_to)
    const daysRemaining = Math.floor((validTo.getTime() - Date.now()) / 86400000)

    const asn1Curve = (cert as any).asn1Curve ?? null
    const nistCurve = asn1Curve ? (NIST_CURVE_MAP[asn1Curve.toLowerCase()] ?? null) : null

    const extKeyUsage = Array.isArray((cert as any).ext_key_usage)
      ? ((cert as any).ext_key_usage as string[]).map((oid) => EKU_MAP[oid] ?? oid)
      : []

    const altNames = (cert.subjectaltname ?? '')
      .split(',')
      .map((s: string) => s.trim().replace(/^DNS:/, ''))
      .filter(Boolean)

    // Forward secrecy: TLS 1.3 always provides PFS; older TLS needs ECDHE/DHE in cipher
    const isTls13 = first.protocol === 'TLSv1.3'
    const forwardSecrecy =
      isTls13 || (!!first.cipher?.name && /(?:^|[_-])(?:E?C?DHE)[_-]/i.test(first.cipher.name))

    const labs = await fetchSslLabs(target.hostname)

    const out: SslOut = {
      subject: cert.subject as any,
      issuer: cert.issuer as any,
      validFrom: cert.valid_from,
      validTo: cert.valid_to,
      daysRemaining,
      trusted,
      serialNumber: cert.serialNumber,
      fingerprint256: cert.fingerprint256,
      altNames,
      signatureAlgorithm: (cert as any).sigalg ?? null,
      keyAlgorithm: (cert as any).pubkey?.asymmetricKeyType ?? null,
      keyBits: (cert as any).bits ?? null,
      asn1Curve,
      nistCurve,
      extKeyUsage,
      protocol: first.protocol,
      cipher: first.cipher?.name ?? null,
      cipherStandard: first.cipher?.standardName ?? null,
      cipherVersion: first.cipher?.version ?? null,
      alpnProtocol: first.alpn,
      forwardSecrecy,
      sessionResumption,
      ocspStapling: first.ocspStapled,
      ephemeralKey: first.ephemeralKey,
      labs,
    }
    return out
  },
})
