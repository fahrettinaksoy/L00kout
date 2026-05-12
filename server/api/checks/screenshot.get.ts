import { defineCheck } from '../../utils/defineCheck'
import { fetchWithTimeout } from '../../utils/target'

export default defineCheck({
  id: 'screenshot',
  handler: async ({ target }) => {
    const apiKey = process.env.SCREENSHOT_API_KEY
    if (apiKey) {
      return {
        provider: 'screenshotone',
        imageUrl: `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(target.url)}&format=jpg&viewport_width=1280&viewport_height=720`,
      }
    }

    // Try microlink first (no key, free tier)
    try {
      const res = await fetchWithTimeout(
        `https://api.microlink.io/?url=${encodeURIComponent(target.url)}&screenshot=true&meta=false&embed=screenshot.url`,
        {},
        10000,
      )
      if (res.ok && res.headers.get('content-type')?.startsWith('image')) {
        return { provider: 'microlink.io', imageUrl: res.url }
      }
    } catch {}

    // Fallback: thum.io
    const url = `https://image.thum.io/get/width/1200/${encodeURIComponent(target.url)}`
    try {
      const res = await fetchWithTimeout(url, { method: 'HEAD' }, 8000)
      return { provider: 'thum.io', imageUrl: url, ok: res.ok }
    } catch (e: unknown) {
      return {
        provider: null,
        error: e instanceof Error ? e.message : String(e),
        hint: 'Set SCREENSHOT_API_KEY env var for production-quality screenshots.',
      }
    }
  },
})
