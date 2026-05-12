import { promises as dns } from 'node:dns'
import { z } from 'zod'
import { defineCheck } from '../../utils/defineCheck'
import { AppError } from '../../utils/errors'
import { fetchJson } from '../../utils/upstream'
import { cached, CACHE_TTL } from '../../utils/cache'

interface LocationData {
  ip: string
  ipv4: string[]
  ipv6: string[]
  country: string | null
  countryCode: string | null
  city: string | null
  region: string | null
  postal: string | null
  org: string | null
  isp: string | null
  asn: string | null
  timezone: string | null
  latitude: number | null
  longitude: number | null
  languages: string[]
  currency: { code: string | null; name: string | null }
}

const IpApiResponse = z.object({
  status: z.string(),
  query: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
  regionName: z.string().optional(),
  city: z.string().optional(),
  zip: z.string().optional(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  timezone: z.string().optional(),
  isp: z.string().optional(),
  org: z.string().optional(),
  as: z.string().optional(),
})

const RestCountriesResponse = z.object({
  languages: z.record(z.string(), z.string()).optional(),
  currencies: z.record(z.string(), z.object({ name: z.string() }).passthrough()).optional(),
})

const fetchIpApi = async (ip: string): Promise<Partial<LocationData> | null> => {
  const d = await fetchJson(
    `http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`,
    IpApiResponse,
    { timeoutMs: 6_000, softFail: true },
  )
  if (!d || d.status !== 'success') return null
  return {
    ip: d.query,
    country: d.country,
    countryCode: d.countryCode,
    city: d.city,
    region: d.regionName,
    postal: d.zip || null,
    org: d.org || d.isp,
    isp: d.isp,
    asn: d.as,
    timezone: d.timezone,
    latitude: d.lat,
    longitude: d.lon,
  }
}

const fetchCountryInfo = async (
  code: string,
): Promise<{ languages: string[]; currency: { code: string | null; name: string | null } }> => {
  const empty = { languages: [] as string[], currency: { code: null, name: null } }
  const d = await fetchJson(
    `https://restcountries.com/v3.1/alpha/${code}?fields=languages,currencies`,
    RestCountriesResponse,
    { timeoutMs: 6_000, softFail: true },
  ).catch(() => null)
  if (!d) return empty
  const languages = d.languages ? Object.values(d.languages) : []
  const currencyEntry = d.currencies ? Object.entries(d.currencies)[0] : null
  const currency = currencyEntry
    ? { code: currencyEntry[0], name: currencyEntry[1].name }
    : { code: null, name: null }
  return { languages, currency }
}

export default defineCheck({
  id: 'location',
  handler: async ({ target }) => {
    let ipv4: string[] = []
    let ipv6: string[] = []
    if (target.isIp) {
      ipv4 = [target.hostname]
    } else {
      ;[ipv4, ipv6] = await Promise.all([
        dns.resolve4(target.hostname).catch(() => []),
        dns.resolve6(target.hostname).catch(() => []),
      ])
    }

    const ip = ipv4[0] ?? target.hostname
    if (!ip) throw new AppError('DNS_RESOLUTION_FAILED', 502, { hostname: target.hostname })

    // Geolocation rarely moves; country info effectively never.
    const base = await cached('geo-ipapi', [ip], CACHE_TTL.long, () => fetchIpApi(ip))
    if (!base) throw new AppError('UPSTREAM_UNAVAILABLE', 502, { provider: 'ip-api.com' })

    const country = base.countryCode
      ? await cached('geo-country', [base.countryCode], CACHE_TTL.day, () =>
          fetchCountryInfo(base.countryCode!),
        )
      : { languages: [], currency: { code: null, name: null } }

    const out: LocationData = {
      ip: base.ip ?? ip,
      ipv4,
      ipv6,
      country: base.country ?? null,
      countryCode: base.countryCode ?? null,
      city: base.city ?? null,
      region: base.region ?? null,
      postal: base.postal ?? null,
      org: base.org ?? null,
      isp: base.isp ?? null,
      asn: base.asn ?? null,
      timezone: base.timezone ?? null,
      latitude: base.latitude ?? null,
      longitude: base.longitude ?? null,
      languages: country.languages,
      currency: country.currency,
    }
    return out
  },
})
