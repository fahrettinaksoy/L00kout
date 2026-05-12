import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

const parseSetCookie = (raw: string) => {
  const parts = raw.split(';').map((p) => p.trim())
  const [nameValue, ...attrs] = parts
  const [name, ...valParts] = (nameValue ?? '').split('=')
  const flags = attrs.map((a) => a.toLowerCase())
  return {
    name,
    value: valParts.join('='),
    httpOnly: flags.includes('httponly'),
    secure: flags.includes('secure'),
    sameSite: flags.find((f) => f.startsWith('samesite='))?.split('=')[1] ?? null,
    expires: flags.find((f) => f.startsWith('expires='))?.slice(8) ?? null,
  }
}

export default defineCheck({
  id: 'cookies',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, { method: 'GET', redirect: 'follow' }, 10000)
    const setCookies: string[] =
      (res.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie?.() ?? []
    const cookies = setCookies.map(parseSetCookie)
    return {
      count: cookies.length,
      secure: cookies.filter((c) => c.secure).length,
      httpOnly: cookies.filter((c) => c.httpOnly).length,
      cookies,
    }
  },
})
