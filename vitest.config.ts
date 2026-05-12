import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts'],
    exclude: ['node_modules', '.nuxt', 'e2e/**', 'dist/**'],
    globals: true,
    environmentMatchGlobs: [['tests/components/**', 'happy-dom']],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      // Limit coverage to the pure, unit-testable modules. Endpoint handlers
      // (server/api/checks/*.get.ts), Nitro plugins and Nuxt composables that
      // depend on framework auto-imports are exercised by E2E / runtime
      // tests instead and would otherwise drag the % down to zero.
      include: [
        'shared/url.ts',
        'app/composables/useCheckStatus.ts',
        'server/utils/dns.ts',
        'server/utils/errors.ts',
        'server/utils/httpSecurity.ts',
        'server/utils/rateLimit.ts',
        'server/utils/scoring.ts',
        'server/utils/ssrf.ts',
      ],
      exclude: ['**/*.spec.ts', 'app/**/*.vue', '.nuxt/**', 'node_modules/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '@': fileURLToPath(new URL('./app', import.meta.url)),
      '~~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },
})
