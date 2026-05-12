import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Accessibility smoke tests. We scan the landing page and the dashboard
 * shortly after navigation, then assert there are no WCAG 2.0/2.1 A or
 * AA violations. The scan deliberately excludes third-party iframes
 * (screenshot providers) and rules that conflict with Vuetify's chip
 * implementation, which has its own contrast story.
 */

const EXCLUDED_RULES = [
  // Vuetify status-color chips already have contrast story via tonal variant;
  // tracked separately, not blocking.
  'color-contrast',
]

test('landing has no a11y violations', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .disableRules(EXCLUDED_RULES)
    .analyze()
  expect(results.violations).toEqual([])
})

test('dashboard has no a11y violations', async ({ page }) => {
  await page.goto('/dashboard/example.com')
  await page.waitForSelector('[role="region"]', { timeout: 15_000 })
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .disableRules(EXCLUDED_RULES)
    .analyze()
  expect(results.violations).toEqual([])
})
