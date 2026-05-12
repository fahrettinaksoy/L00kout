import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const SIGNATURES: { name: string; matchers: ((h: Headers) => boolean)[] }[] = [
  {
    name: 'Cloudflare',
    matchers: [(h) => !!h.get('cf-ray'), (h) => /cloudflare/i.test(h.get('server') ?? '')],
  },
  {
    name: 'Sucuri',
    matchers: [(h) => /sucuri/i.test(h.get('server') ?? ''), (h) => !!h.get('x-sucuri-id')],
  },
  {
    name: 'Akamai',
    matchers: [
      (h) => /akamai/i.test(h.get('server') ?? ''),
      (h) => !!h.get('x-akamai-transformed'),
    ],
  },
  {
    name: 'AWS WAF',
    matchers: [(h) => /awselb/i.test(h.get('server') ?? ''), (h) => !!h.get('x-amz-cf-id')],
  },
  {
    name: 'Fastly',
    matchers: [(h) => !!h.get('x-fastly-request-id'), (h) => /fastly/i.test(h.get('server') ?? '')],
  },
  {
    name: 'Imperva',
    matchers: [(h) => !!h.get('x-iinfo'), (h) => /incap/i.test(h.get('set-cookie') ?? '')],
  },
  {
    name: 'F5 BIG-IP',
    matchers: [(h) => /BigIP/i.test(h.get('server') ?? ''), (h) => !!h.get('x-cnection')],
  },
]

export default defineCheck({
  id: 'firewall',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, { redirect: 'follow' }, 10000)
    const detected: string[] = []
    for (const sig of SIGNATURES) {
      if (sig.matchers.some((m) => m(res.headers))) detected.push(sig.name)
    }
    return { detected, hasWaf: detected.length > 0, server: res.headers.get('server') }
  },
})
