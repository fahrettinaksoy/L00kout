import * as cheerio from 'cheerio'
import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'
import { AppError } from '../../utils/errors'

interface TechSignature {
  name: string
  category: string
  patterns: {
    headers?: Record<string, RegExp>
    html?: RegExp
    cookies?: RegExp
    meta?: Record<string, RegExp>
    scripts?: RegExp
  }
}

const SIGS: TechSignature[] = [
  {
    name: 'WordPress',
    category: 'CMS',
    patterns: { html: /wp-content|wp-includes/i, meta: { generator: /WordPress/i } },
  },
  {
    name: 'Drupal',
    category: 'CMS',
    patterns: { meta: { generator: /Drupal/i }, html: /drupal-/i },
  },
  { name: 'Joomla', category: 'CMS', patterns: { meta: { generator: /Joomla/i } } },
  {
    name: 'Shopify',
    category: 'E-commerce',
    patterns: { html: /cdn\.shopify\.com|shopify-section/i },
  },
  { name: 'Magento', category: 'E-commerce', patterns: { html: /Magento|mage\//i } },
  { name: 'Next.js', category: 'Framework', patterns: { html: /__NEXT_DATA__|_next\/static/i } },
  { name: 'Nuxt.js', category: 'Framework', patterns: { html: /__NUXT__|_nuxt\//i } },
  { name: 'React', category: 'JS Library', patterns: { html: /data-reactroot|react-dom/i } },
  { name: 'Vue.js', category: 'JS Library', patterns: { html: /data-v-[a-f0-9]{8}|__vue__/i } },
  { name: 'Angular', category: 'JS Library', patterns: { html: /ng-version=|ng-app=/i } },
  { name: 'jQuery', category: 'JS Library', patterns: { scripts: /jquery[.-]/i } },
  { name: 'Bootstrap', category: 'UI Framework', patterns: { html: /bootstrap[.-]/i } },
  { name: 'Tailwind CSS', category: 'UI Framework', patterns: { html: /tailwind/i } },
  { name: 'Cloudflare', category: 'CDN', patterns: { headers: { 'cf-ray': /./ } } },
  {
    name: 'Vercel',
    category: 'Hosting',
    patterns: { headers: { 'x-vercel-id': /./, server: /Vercel/i } },
  },
  {
    name: 'Netlify',
    category: 'Hosting',
    patterns: { headers: { 'x-nf-request-id': /./, server: /Netlify/i } },
  },
  {
    name: 'Google Analytics',
    category: 'Analytics',
    patterns: { html: /google-analytics|gtag\(/i },
  },
  { name: 'Plausible', category: 'Analytics', patterns: { html: /plausible\.io/i } },
  { name: 'Stripe', category: 'Payment', patterns: { html: /js\.stripe\.com/i } },
  { name: 'reCAPTCHA', category: 'Security', patterns: { html: /recaptcha/i } },
]

export default defineCheck({
  id: 'tech-stack',
  ssrfGuard: true,
  handler: async ({ target }) => {
    const res = await fetchWithTimeout(target.url, { redirect: 'follow' }, 12000)
    if (!res.ok)
      throw new AppError('UPSTREAM_HTTP_ERROR', 502, { url: target.url, status: res.status })
    const html = await res.text()
    const $ = cheerio.load(html)
    const headers: Record<string, string> = {}
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v
    })
    const metaTags: Record<string, string> = {}
    $('meta').each((_, el) => {
      const name = ($(el).attr('name') || $(el).attr('property') || '').toLowerCase()
      const content = $(el).attr('content') ?? ''
      if (name) metaTags[name] = content
    })
    const scripts = $('script[src]')
      .map((_, el) => $(el).attr('src') ?? '')
      .get()
      .join('\n')

    const detected: { name: string; category: string }[] = []
    for (const sig of SIGS) {
      let match = false
      if (sig.patterns.headers) {
        for (const [k, rx] of Object.entries(sig.patterns.headers)) {
          if (headers[k] && rx.test(headers[k])) {
            match = true
            break
          }
        }
      }
      if (!match && sig.patterns.html && sig.patterns.html.test(html)) match = true
      if (!match && sig.patterns.scripts && sig.patterns.scripts.test(scripts)) match = true
      if (!match && sig.patterns.meta) {
        for (const [k, rx] of Object.entries(sig.patterns.meta)) {
          if (metaTags[k] && rx.test(metaTags[k])) {
            match = true
            break
          }
        }
      }
      if (match) detected.push({ name: sig.name, category: sig.category })
    }
    return { detected, total: detected.length }
  },
})
