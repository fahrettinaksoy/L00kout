import { expect, test } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders and rejects invalid input', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/L00kout/i).first()).toBeVisible()

    // Try submitting a clearly invalid URL
    const input = page.getByRole('textbox').first()
    await input.fill('not a url at all')
    await page.getByRole('button', { name: /(Başlat|Start|Analyze|Analiz)/i }).click()

    // We should still be on landing (URL didn't change to /dashboard/...)
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:\d+\/?$/)
  })

  test('navigates to dashboard for valid hostname', async ({ page }) => {
    await page.goto('/')
    const input = page.getByRole('textbox').first()
    await input.fill('example.com')
    await page.getByRole('button', { name: /(Başlat|Start|Analyze|Analiz)/i }).click()

    await page.waitForURL(/\/dashboard\/example\.com/)
    await expect(page.locator('[role="region"]').first()).toBeVisible({ timeout: 15_000 })
  })
})

test.describe('Security headers', () => {
  test('serves CSP and HSTS headers', async ({ request }) => {
    const res = await request.get('/')
    expect(res.status()).toBe(200)
    const headers = res.headers()
    expect(headers['content-security-policy']).toBeTruthy()
    expect(headers['strict-transport-security']).toBeTruthy()
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-frame-options']).toBe('DENY')
  })
})

test.describe('API rate limiting', () => {
  test('returns X-RateLimit headers', async ({ request }) => {
    const res = await request.get('/api/checks/dns?url=example.com')
    expect(res.headers()['x-ratelimit-limit']).toBeTruthy()
    expect(res.headers()['x-ratelimit-remaining']).toBeTruthy()
  })

  test('SSRF guard blocks private IPs', async ({ request }) => {
    const res = await request.get('/api/checks/http-security?url=http://127.0.0.1/')
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.data?.code).toBe('SSRF_BLOCKED')
  })

  test('rejects missing url parameter', async ({ request }) => {
    const res = await request.get('/api/checks/dns')
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.data?.code).toBe('URL_REQUIRED')
  })
})

test.describe('Metrics endpoint', () => {
  test('returns 404 when METRICS_TOKEN unset', async ({ request }) => {
    const res = await request.get('/api/metrics')
    expect(res.status()).toBe(404)
  })
})
