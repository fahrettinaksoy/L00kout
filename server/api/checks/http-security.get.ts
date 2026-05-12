import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'
import { SECURITY_HEADERS, parseHsts, type SecurityHeaderName } from '../../utils/httpSecurity'
import { percent, scoreToGrade } from '../../utils/scoring'

interface HeaderCheck {
  present: boolean
  value: string | null
}

export default defineCheck({
  id: 'http-security',
  ssrfGuard: true,
  handler: async ({ target }) => {
    let res: Response
    try {
      res = await fetchWithTimeout(target.url, { method: 'GET', redirect: 'follow' }, 10_000)
    } catch (e) {
      throw new AppError('UPSTREAM_UNAVAILABLE', 502, { hostname: target.hostname }, { cause: e })
    }

    const checks: Record<SecurityHeaderName, HeaderCheck> = {} as Record<
      SecurityHeaderName,
      HeaderCheck
    >
    for (const h of SECURITY_HEADERS) {
      const v = res.headers.get(h)
      checks[h] = { present: !!v, value: v }
    }
    const present = Object.values(checks).filter((c) => c.present).length
    const score = percent(present, SECURITY_HEADERS.length)
    return {
      score,
      grade: scoreToGrade(score),
      present,
      total: SECURITY_HEADERS.length,
      checks,
      hsts: parseHsts(res.headers.get('strict-transport-security')),
    }
  },
})
