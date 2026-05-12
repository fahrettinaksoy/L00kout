import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'
import { cached, CACHE_TTL } from '../../utils/cache'

interface WhoisOut {
  domain: string
  registrar: string | null
  registrarUrl: string | null
  registrarIanaId: string | null
  registrarWhois: string | null
  created: string | null
  updated: string | null
  expires: string | null
  status: string[]
  nameServers: string[]
  dnssec: string | null
  registryId: string | null
}

const findEvent = (events: any[], action: string): string | null => {
  if (!Array.isArray(events)) return null
  const e = events.find((x) => x?.eventAction === action)
  return e?.eventDate ?? null
}

const findEntity = (entities: any[], role: string): any | null => {
  if (!Array.isArray(entities)) return null
  return entities.find((e) => Array.isArray(e?.roles) && e.roles.includes(role)) ?? null
}

const vcardField = (vcard: any[] | undefined, name: string): string | null => {
  if (!Array.isArray(vcard)) return null
  const f = vcard.find((row) => Array.isArray(row) && row[0] === name)
  return f ? String(f[3] ?? '') : null
}

const entityIana = (entity: any): string | null => {
  if (!entity) return null
  if (entity.publicIds && Array.isArray(entity.publicIds)) {
    const iana = entity.publicIds.find((p: any) => /IANA/i.test(p.type ?? ''))
    if (iana?.identifier) return String(iana.identifier)
  }
  return entity.handle ?? null
}

export default defineCheck({
  id: 'whois',
  handler: async ({ target }) => {
    if (target.isIp) {
      throw new AppError('INVALID_INPUT', 400, { reason: 'WHOIS IP lookup not supported' })
    }

    // WHOIS/RDAP data updates at most daily, often weekly — cache aggressively.
    return cached('whois', [target.hostname], CACHE_TTL.day, async () =>
      fetchAndParse(target.hostname),
    )
  },
})

const fetchAndParse = async (hostname: string): Promise<WhoisOut> => {
  const res = await fetchWithTimeout(
    `https://rdap.org/domain/${encodeURIComponent(hostname)}`,
    { headers: { Accept: 'application/rdap+json' } },
    10000,
  )

  if (!res.ok) {
    throw new AppError('UPSTREAM_HTTP_ERROR', 502, { provider: 'rdap.org', status: res.status })
  }

  const data = (await res.json()) as any
  const registrarEntity = findEntity(data.entities ?? [], 'registrar')
  const registrarName = vcardField(registrarEntity?.vcardArray?.[1], 'fn')

  const nameServers = Array.isArray(data.nameservers)
    ? data.nameservers
        .map((n: any) => String(n.ldhName ?? n.unicodeName ?? '').toLowerCase())
        .filter(Boolean)
    : []

  const registrarWhois = registrarEntity?.entities?.find(
    (e: any) => Array.isArray(e?.roles) && e.roles.includes('abuse'),
  )?.vcardArray?.[1]
  const whoisUrl = vcardField(registrarWhois, 'url')

  const out: WhoisOut = {
    domain: data.ldhName ?? data.unicodeName ?? hostname,
    registrar: registrarName ?? null,
    registrarUrl: vcardField(registrarEntity?.vcardArray?.[1], 'url'),
    registrarIanaId: entityIana(registrarEntity),
    registrarWhois: whoisUrl,
    created: findEvent(data.events, 'registration'),
    updated:
      findEvent(data.events, 'last changed') ??
      findEvent(data.events, 'last update of RDAP database'),
    expires: findEvent(data.events, 'expiration'),
    status: Array.isArray(data.status) ? data.status : [],
    nameServers,
    dnssec: data.secureDNS?.delegationSigned ? 'signed' : 'unsigned',
    registryId: data.handle ?? null,
  }
  return out
}
