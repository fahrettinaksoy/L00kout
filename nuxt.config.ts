export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  modules: [
    'vuetify-nuxt-module',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/eslint',
    'nuxt-security',
  ],
  security: {
    // CSP: tight defaults, then allow exactly what the app needs at runtime.
    headers: {
      contentSecurityPolicy: {
        'base-uri': ["'self'"],
        'default-src': ["'self'"],
        'connect-src': ["'self'"],
        'script-src': [
          "'self'",
          // Nuxt's hydration script + Vuetify inline-style helpers need
          // 'unsafe-inline' until they ship nonced builds. Revisit when
          // Nuxt enables nonce by default.
          "'unsafe-inline'",
          "'strict-dynamic'",
        ],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': [
          "'self'",
          'data:',
          'https:',
          // favicon proxy + screenshot providers
          'https://www.google.com',
          'https://api.microlink.io',
          'https://image.thum.io',
          'https://api.screenshotone.com',
        ],
        'font-src': ["'self'", 'data:'],
        'frame-ancestors': ["'none'"],
        'object-src': ["'none'"],
        'upgrade-insecure-requests': true,
      },
      crossOriginEmbedderPolicy: 'unsafe-none', // microlink/thum.io iframes
      strictTransportSecurity: {
        maxAge: 31_536_000,
        includeSubdomains: true,
        preload: false,
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
      },
    },
    // We already implement our own per-IP limiter in middleware/rate-limit.ts.
    // Disable nuxt-security's built-in one to avoid double counting.
    rateLimiter: false,
    // We sanitize via Vue templating; do not double-encode response bodies.
    xssValidator: false,
    requestSizeLimiter: {
      maxRequestSizeInBytes: 1_000_000,
      maxUploadFileRequestInBytes: 0,
      throwError: true,
    },
    // Metrics endpoint is internal — no Nuxt-managed CORS needed for it.
    corsHandler: false,
  },
  eslint: {
    config: {
      stylistic: false,
    },
  },
  css: ['@mdi/font/css/materialdesignicons.css', '~/assets/styles/global.scss'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'tr',
    locales: [
      { code: 'tr', name: 'Türkçe', flag: '🇹🇷', file: 'tr.json' },
      { code: 'en', name: 'English', flag: '🇬🇧', file: 'en.json' },
    ],
    detectBrowserLanguage: {
      useCookie: false,
      redirectOn: 'root',
      fallbackLocale: 'tr',
    },
  },
  vuetify: {
    moduleOptions: {
      ssrClientHints: { reloadOnFirstRequest: false },
    },
    vuetifyOptions: {
      icons: { defaultSet: 'mdi' },
      theme: {
        defaultTheme: 'l00koutDark',
        themes: {
          l00koutDark: {
            dark: true,
            colors: {
              background: '#0B0F17',
              surface: '#121826',
              'surface-bright': '#1B2333',
              primary: '#5B8DEF',
              secondary: '#22D3EE',
              success: '#22C55E',
              warning: '#F59E0B',
              error: '#EF4444',
              info: '#60A5FA',
              'on-background': '#E5E7EB',
              'on-surface': '#E5E7EB',
            },
          },
          l00koutLight: {
            dark: false,
            colors: {
              background: '#F8FAFC',
              surface: '#FFFFFF',
              'surface-bright': '#F1F5F9',
              primary: '#3B82F6',
              secondary: '#0EA5E9',
              success: '#16A34A',
              warning: '#D97706',
              error: '#DC2626',
              info: '#2563EB',
              'on-background': '#0F172A',
              'on-surface': '#0F172A',
            },
          },
        },
      },
      defaults: {
        VCard: { rounded: 'lg', elevation: 0, border: true },
        VBtn: { rounded: 'lg', class: 'text-none' },
        VTextField: { variant: 'outlined', density: 'comfortable' },
      },
    },
  },
  runtimeConfig: {
    public: {
      apiTimeoutMs: Number(process.env.NUXT_PUBLIC_API_TIMEOUT_MS ?? 40_000),
      requestBatchSize: Number(process.env.NUXT_PUBLIC_REQUEST_BATCH_SIZE ?? 5),
    },
    apiCorsOrigin: process.env.API_CORS_ORIGIN ?? '*',
    sentryDsn: process.env.SENTRY_DSN ?? '',
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000),
      max: Number(process.env.RATE_LIMIT_MAX ?? 60),
    },
  },
  nitro: {
    routeRules: {
      '/api/checks/**': { cors: true },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // Group the 32 specialised renderers into a small number of chunks
          // by category so dashboards don't pay 32 separate HTTP round-trips.
          // The dashboard typically uses all of them anyway.
          manualChunks(id: string) {
            if (id.includes('/components/renderers/')) return 'renderers'
            if (id.includes('node_modules/vuetify')) return 'vendor-vuetify'
            if (id.includes('node_modules/@vueuse')) return 'vendor-vueuse'
            if (id.includes('node_modules/zod')) return 'vendor-zod'
            return undefined
          },
        },
      },
    },
  },
  typescript: {
    strict: true,
  },
})
