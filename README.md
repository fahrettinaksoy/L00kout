# L00kout

> An open-source, enterprise-grade tool that analyses any website in seconds with **31 security, network and content checks**.

L00kout is a single-screen dashboard application that gathers DNS, SSL/TLS, HTTP, network, performance, content and reputation intelligence about any domain or URL. All checks run in parallel and the results stream into the screen live as they complete; every card manages its own refresh, cancellation and raw-data view independently.

It targets developers, SREs, security researchers and technical content creators who want to see a domain's security, infrastructure and reputation profile quickly. The tool runs locally without Docker, falls back gracefully to free data sources, and fills every category in full even without third-party API keys. Collected data is never persisted to a database — each analysis is independent and on-demand.

> 🌐 Türkçe sürüm: [README.tr.md](README.tr.md)

---

## ✨ Highlights

- 🚀 **31 checks, one click** — DNS, SSL/TLS, HTTP, network, content, performance, reputation.
- 🌐 **Bilingual UI** — Turkish + English; auto-detects browser language, persists the choice in `localStorage`.
- 🎨 **Light & dark theme** — follows the OS preference; user choice is persisted.
- 📊 **Wide grid layout** — every result visible at a glance.
- 🔍 **Per-check info drawer** — _what is this check?_, _why does it matter?_, _what should I look for?_ — answered individually for every card.
- ♻️ **Per-card refresh** — re-run a single check without restarting the whole batch.
- 🗺️ **Interactive map** — server location plotted on OpenStreetMap.
- 🌍 **Works with zero API keys** — every check has a free-tier fallback.
- 📱 **Fully responsive** — mobile-first, 480px → 5K.

---

## 🛡️ Production-Ready Infrastructure

The project is prepared for a production environment:

| Topic                   | Implementation                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSRF protection**     | `assertPublicTarget()` resolves the hostname and rejects any address in RFC 1918 / loopback / link-local / cloud-metadata / IPv4-mapped private ranges before any outbound request. |
| **Rate limiting**       | Per-IP sliding-window limiter on `/api/checks/**`; returns `X-RateLimit-*` headers. Env: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.                                                  |
| **Error taxonomy**      | Every error is mapped to a closed `ErrorCode` set (`SSRF_BLOCKED`, `UPSTREAM_TIMEOUT`, `RATE_LIMITED`, …). The client uses the code as an i18n key — no raw text leaks.             |
| **Structured logging**  | NDJSON in production, human-readable in dev. Per-check duration + outcome + hostname.                                                                                               |
| **Sentry**              | Automatically enabled once `SENTRY_DSN` is set; only unexpected `INTERNAL_ERROR`s are reported (upstream noise is filtered out).                                                    |
| **Prometheus metrics**  | `/api/metrics` (bearer-token protected): check runs, latency histograms, cache hit/miss, rate-limit drops.                                                                          |
| **Security headers**    | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — via `nuxt-security`.                                                                      |
| **Input validation**    | `parseTarget()` enforces strict IPv4 (0-255 octet), IPv6, RFC 1035 hostname and max-length validation. Shared between client and server.                                            |
| **Upstream validation** | Third-party JSON responses are parsed with Zod. Schema mismatches surface as `UPSTREAM_HTTP_ERROR` and are reported.                                                                |
| **Caching**             | Stable data (WHOIS, SSL Labs, geolocation, country info) is TTL-cached on top of Nitro storage.                                                                                     |
| **Adaptive scheduling** | Worker-pool scheduler runs checks sorted by descending `estimatedMs`. Wall-clock ≈ `max(individual)`.                                                                               |

---

## 🧩 Check Categories

L00kout runs 31 checks across 7 categories:

### 🛡️ Security (5)

| Check                     | Description                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **SSL Certificate**       | Certificate details, TLS protocol, cipher, ALPN, OCSP, Forward Secrecy, Session Resumption and SSL Labs grade                              |
| **HTTP Security Headers** | CSP, HSTS (incl. preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin policies + A-F grade |
| **WAF Detection**         | Cloudflare, AWS WAF, Sucuri, Fastly, Imperva, Akamai, F5 BIG-IP                                                                            |
| **Security.txt**          | `/.well-known/security.txt` and the responsible disclosure policy                                                                          |
| **Cookie Analysis**       | HttpOnly, Secure, SameSite, persistent flag analysis                                                                                       |

### 🌐 DNS (5)

| Check                   | Description                                                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| **DNS Records**         | A, AAAA, MX, NS, CNAME, SOA, TXT, SRV + nameserver DoH support + TXT classification (SPF/DMARC/DKIM/BIMI) |
| **DNSSEC**              | DNSKEY, DS, RRSIG records + DNS query flags (RD/RA/TC/AD/CD)                                              |
| **Email Configuration** | SPF / DKIM / DMARC / MX score                                                                             |
| **WHOIS**               | Domain registrant, registrar, creation and expiry dates via the RDAP protocol                             |
| **Subdomains**          | Subdomain discovery via Certificate Transparency logs + hackertarget.com                                  |

### 🔌 Network (5)

| Check               | Description                                                 |
| ------------------- | ----------------------------------------------------------- |
| **Server Location** | IPv4/IPv6, geolocation, country, ISP, ASN + interactive map |
| **Hostnames**       | Reverse DNS (PTR) lookup — hostnames per IP                 |
| **Open Ports**      | 17 common TCP ports (SSH, HTTP, SMTP, MySQL, Redis, etc.)   |
| **Traceroute**      | Network path and hop information to the target server       |
| **Server Status**   | HTTP status code and response time                          |

### ⚡ Performance (3)

| Check                | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| **Lighthouse Score** | Performance, Accessibility, Best Practices, SEO + Mozilla Observatory fallback |
| **Carbon Footprint** | Estimated CO₂ emissions — Website Carbon API + local-estimate fallback         |
| **Screenshot**       | Headless-browser screenshot of the site (Microlink / thum.io / ScreenshotOne)  |

### 📋 Metadata (4)

| Check            | Description                                                                          |
| ---------------- | ------------------------------------------------------------------------------------ |
| **HTTP Headers** | Detailed list of all response headers                                                |
| **Tech Stack**   | Framework, CMS, CDN, analytics, payment and security technology detection (20+ sigs) |
| **Social Tags**  | Open Graph, Twitter Cards, canonical URL + preview image                             |
| **Redirects**    | HTTP redirect chain and final URL                                                    |

### 🤖 Crawling (4)

| Check               | Description                                   |
| ------------------- | --------------------------------------------- |
| **robots.txt**      | Allow, Disallow, Sitemap rules                |
| **Sitemap**         | Per-URL lastmod, changefreq, priority details |
| **Links**           | Internal and external links found on the page |
| **Wayback Machine** | Historical snapshots from archive.org         |

### 🏆 Reputation (5)

| Check                | Description                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| **Global Ranking**   | Popularity on the Tranco list + historical sparkline                              |
| **Block Lists**      | Blocklist check against 12 DNS resolvers (AdGuard, Cloudflare, Quad9, OpenDNS, …) |
| **Threat Detection** | URLhaus + PhishReport threat intelligence                                         |
| **Shodan**           | Exposed services, CVEs and banner data (free InternetDB)                          |
| **Malware Scan**     | URLhaus + ThreatFox + Google Safe Browsing                                        |

---

## 🛠️ Technology Stack

| Layer                   | Technology                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Frontend**            | Nuxt 4, Vue 3 (Composition API + `<script setup>`), TypeScript strict mode           |
| **UI**                  | Vuetify 3, Material Design Icons                                                     |
| **State**               | Pinia + Nuxt `useState`                                                              |
| **i18n**                | `@nuxtjs/i18n` (TR + EN)                                                             |
| **Backend**             | Nitro (Nuxt's embedded server)                                                       |
| **Native APIs**         | `node:tls`, `node:net`, `node:dns`, `node:crypto`                                    |
| **Validation**          | Zod (input + upstream response)                                                      |
| **Parsing**             | Cheerio (HTML), xml2js (XML)                                                         |
| **Domain**              | whoiser, psl (public suffix list)                                                    |
| **Security**            | `nuxt-security` (CSP/HSTS/headers), in-house SSRF guard, sliding-window rate limiter |
| **Observability**       | `consola` (NDJSON), `prom-client` (Prometheus), `@sentry/node`                       |
| **Style**               | SCSS, CSS variables, Vuetify theme tokens                                            |
| **Tooling**             | ESLint (`@nuxt/eslint`), Prettier, Husky + lint-staged, vue-tsc, Vitest, Playwright  |
| **Docs / quality gate** | typedoc, size-limit, `@axe-core/playwright`                                          |

---

## 📦 Installation

### Prerequisites

- **Node.js 22+** (the repo ships an `.nvmrc`: `nvm use`)
- **npm 10+**

### Steps

```bash
# 1) Install dependencies
npm ci

# 2) (Optional) Configure free API keys
cp .env.example .env
# edit the .env file

# 3) Start the development server
npm run dev
```

The server starts at `{BASE_URL}` (default dev port). You can begin by entering a domain (e.g. `github.com`) as your first target.

---

## 🚀 Commands

```bash
# Dev & build
npm run dev               # Development server ({BASE_URL})
npm run build             # Production build (.output/)
npm run preview           # Local preview of the build
npm run generate          # Static build

# Code quality
npm run lint              # ESLint
npm run lint:fix          # ESLint + auto-fix
npm run format            # Prettier write
npm run format:check      # Prettier check
npm run typecheck         # nuxt typecheck (vue-tsc)

# Tests
npm run test              # Vitest (unit) — 114 tests
npm run test:watch        # Vitest watch
npm run test:coverage     # Vitest + v8 coverage (60% threshold)
npm run test:e2e          # Playwright E2E (landing + a11y + security + rate-limit)
npm run test:e2e:install  # Download Chromium browser

# Docs & bundle
npm run docs              # typedoc → docs/api/
npm run size              # size-limit bundle budget check
npm run size:why          # Bundle inspector (which package takes how much)

# All-in-one CI
npm run ci                # lint + format:check + typecheck + test
```

---

## ⚙️ Configuration (.env)

All variables are **optional**. Even with none defined, L00kout runs every check via free fallbacks.

### Third-party API keys (optional)

```bash
# Google PageSpeed Insights — raises the rate limit
PAGESPEED_API_KEY=

# Shodan — without a key, InternetDB is used
SHODAN_API_KEY=

# Google Safe Browsing — URLhaus + ThreatFox fallback is available
GOOGLE_SAFE_BROWSING_KEY=

# ScreenshotOne — without a key, Microlink / thum.io fallback is available
SCREENSHOT_API_KEY=
```

### Operational settings

```bash
# Sentry — disabled when DSN is empty
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1

# CORS — tighten to your own origin in production
API_CORS_ORIGIN=*

# Rate limiting (per-IP sliding window on /api/checks/**)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Prometheus scrape token — /api/metrics returns 404 when unset
METRICS_TOKEN=

# Client batching / timeout (public runtimeConfig)
NUXT_PUBLIC_API_TIMEOUT_MS=40000
NUXT_PUBLIC_REQUEST_BATCH_SIZE=5

# E2E settings (optional)
PLAYWRIGHT_PORT=3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100
```

### Where to get keys

| Service          | URL                                                                          | Free tier                    |
| ---------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| Google PageSpeed | https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com | 25,000 queries/day           |
| Shodan           | https://account.shodan.io/register                                           | Limited (InternetDB is free) |
| Safe Browsing    | https://console.cloud.google.com/apis/library/safebrowsing.googleapis.com    | 10,000 queries/day           |
| ScreenshotOne    | https://screenshotone.com/                                                   | 100 screenshots/month        |

---

## 🏗️ Architecture

```text
shared/                              # Code shared between client and server
  url.ts                             # parseTarget + IP detection (single source)
  types/checks.ts                    # Public endpoint response shapes

server/
  api/
    checks/*.get.ts                  # 31 endpoints; each wrapped in defineCheck()
    metrics.get.ts                   # Prometheus scrape (bearer-protected)
  middleware/
    rate-limit.ts                    # Per-IP limit on /api/checks/**
  plugins/
    00.sentry.ts                     # Sentry init (no-op when DSN unset)
  utils/
    defineCheck.ts                   # Wrapper: validation + SSRF + timing + log + metrics
    target.ts                        # getTarget(event), fetchWithTimeout
    ssrf.ts                          # assertPublicTarget() — RFC 1918 + IPv6 + metadata guard
    errors.ts                        # AppError taxonomy + toH3Error (leak-free)
    logger.ts                        # consola — NDJSON in prod
    sentry.ts                        # Lazy init
    metrics.ts                       # prom-client counters + histograms
    cache.ts                         # cached(bucket, parts, ttl, loader)
    rateLimit.ts                     # Sliding-window
    upstream.ts                      # fetchJson<T>(url, zodSchema) + fetchOrThrow
    scoring.ts, dns.ts,              # Pure helpers (unit-tested)
    httpSecurity.ts

app/
  pages/
    index.vue                        # Landing — URL input
    dashboard/[target].vue           # Dashboard — 31-check grid
  layouts/
    default.vue                      # Landing layout
    dashboard.vue                    # App bar + sidebar + main
  components/
    CheckCard.vue                    # ~60 LOC composition wrapper
    CheckCardHeader.vue              # Avatar + title + status + actions
    CheckCardBody.vue                # Status FSM → skeleton/loading/error/data
    CheckCardFooter.vue              # Duration + raw-JSON toggle
    CheckResultRenderer.vue          # Auto-loads renderers/*Renderer.vue (import.meta.glob)
    renderers/                       # 32 specialised renderers
  composables/
    useCheckRegistry.ts              # Central metadata for the 31 checks
    useCheckRunner.ts                # Worker-pool scheduler + AbortController + i18n errors
    useCheckError.ts                 # CheckErrorPayload → i18n format
    useCheckStatus.ts                # statusColor/Icon, formatDuration, path→id (pure)
    useTarget.ts                     # Shared parseTarget re-export
    useInfoDrawer.ts                 # Drawer state
  stores/
    results.ts                       # Pinia — per-check result + state
  types/check.ts                     # CheckMeta, CheckResult, CheckErrorPayload

i18n/locales/                        # tr.json + en.json (+ errors.* block)
tests/                               # Vitest unit tests (URL, SSRF, errors, scoring, scheduling…)
e2e/                                 # Playwright (landing, a11y, security, rate-limit)
docs/
  adr/                               # Architecture Decision Records (0001–0004)
  api/                               # typedoc-generated (gitignored)
.github/workflows/ci.yml             # quality → build/docs (parallel) → e2e
```

### Design Principles

1. **Composition over inheritance** — `<script setup>` + composables everywhere.
2. **Single source of truth** — `parseTarget` in shared/, error codes in errors.ts, scoring in pure modules.
3. **`defineCheck` decorator pattern** — endpoints only deal with domain logic; validation/SSRF/timing/log/metrics are centralised.
4. **Closed error taxonomy** — `ErrorCode` union + `data.code` + i18n key resolution. No raw text leaks to the client.
5. **Convention over configuration** — renderers auto-register from filenames.
6. **Defense in depth** — input validation → SSRF guard → rate limit → CSP → output sanitisation.
7. **Graceful degradation** — every external API has a fallback; no card is ever "empty".
8. **Observability built-in** — log + metric + Sentry are wired in from day one.

---

## 🔌 API Usage

Every check endpoint can also be used as a standalone REST API:

```bash
curl '{BASE_URL}/api/checks/ssl?url=github.com'
curl '{BASE_URL}/api/checks/dns?url=github.com'
curl '{BASE_URL}/api/checks/subdomains?url=github.com'
```

### Headers

Every `/api/checks/**` response carries:

```text
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1747059600
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### Error format

```jsonc
// HTTP 400 — SSRF_BLOCKED example
{
  "statusCode": 400,
  "statusMessage": "SSRF_BLOCKED",
  "data": {
    "code": "SSRF_BLOCKED",
    "context": { "hostname": "127.0.0.1" },
  },
}
```

The client uses `data.code` as an i18n key: `t('errors.SSRF_BLOCKED')`.

### Prometheus metrics

```bash
curl -H "Authorization: Bearer $METRICS_TOKEN" {BASE_URL}/api/metrics
```

Exposed metrics:

```text
l00kout_check_runs_total{id, outcome}
l00kout_check_duration_ms{id, outcome}     # histogram
l00kout_upstream_errors_total{id, code}
l00kout_rate_limit_total
l00kout_cache_total{bucket, outcome}        # hit / miss
# + default process / event-loop / GC metrics
```

---

## 🎨 Theme and Language

### Theme

- **Default:** OS preference (`prefers-color-scheme`)
- **Manual:** the ☀️/🌙 button in the top right
- **Storage:** `localStorage.l00kout_theme`
- **Colors:** Dark `#0B0F17 / #5B8DEF` · Light `#F8FAFC / #3B82F6`

### Language

- **Default:** `navigator.language` (tr/en, fallback: tr)
- **Manual:** the flag in the top right (🇹🇷/🇬🇧)
- **Storage:** `localStorage.l00kout_locale`
- **Translated:** ~265 keys (UI + 31 check titles/descriptions + per-check info + 15 error codes)

---

## 🌍 Free Data Sources

L00kout depends on no paid API.

| Category     | Service                                          |
| ------------ | ------------------------------------------------ |
| Geolocation  | ip-api.com (45 req/min)                          |
| Country data | restcountries.com                                |
| WHOIS        | rdap.org (IANA bootstrap)                        |
| Subdomain    | crt.sh + hackertarget.com                        |
| Reverse DNS  | Node.js `dns.reverse()`                          |
| Threats      | URLhaus + ThreatFox (abuse.ch)                   |
| Exposure     | Shodan InternetDB                                |
| Quality      | Google PageSpeed (25k/day) + Mozilla Observatory |
| Carbon       | Website Carbon API + local estimate              |
| Screenshot   | Microlink + thum.io                              |
| Archive      | Wayback Machine CDX API                          |
| Ranking      | Tranco list API                                  |
| Map          | OpenStreetMap embed                              |

---

## 🧪 Test Coverage

| Kind                   | Count       | Scope                                                                                                                                                                 |
| ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit (Vitest)**      | 114 tests   | URL parsing, SSRF (IPv4 CIDRs, IPv6, metadata), error taxonomy, rate limiter, scoring, DNS classification, HSTS parsing, adaptive scheduling, status/duration helpers |
| **E2E (Playwright)**   | 9 scenarios | Landing render, dashboard navigation, security headers (CSP/HSTS/XFO), rate-limit headers, SSRF guard, URL_REQUIRED, metrics 404 (token unset)                        |
| **A11y (axe-core)**    | 2 pages     | Landing + dashboard — zero WCAG 2.0/2.1 A + AA violations assertion                                                                                                   |
| **Bundle budgets**     | 3 targets   | Landing first-load ≤200KB gz, dashboard first-load ≤250KB gz, shared chunks ≤350KB gz                                                                                 |
| **Coverage threshold** | 60%         | lines / functions / branches / statements (a drop fails the PR)                                                                                                       |

---

## 📐 Architecture Decision Records (ADR)

Significant decisions are documented under [docs/adr/](docs/adr/):

- [0001 — defineCheck wrapper](docs/adr/0001-defineCheck-wrapper.md) — endpoint cross-cutting concerns
- [0002 — Error code taxonomy + i18n](docs/adr/0002-error-code-taxonomy.md) — closed error set + localisation
- [0003 — Zod upstream validation](docs/adr/0003-zod-upstream-validation.md) — schema-validation strategy
- [0004 — Convention-based renderer registry](docs/adr/0004-convention-based-renderer-registry.md) — auto renderer loading

---

## 🤝 Contributing

1. Fork + clone.
2. `npm ci`.
3. `npm run dev`.
4. **To add a new check:**
   - Create `server/api/checks/<my-check>.get.ts` — use `defineCheck({...})`, and add `ssrfGuard: true` if you fetch an external URL.
   - Add a metadata row to `app/composables/useCheckRegistry.ts`.
   - (Optional) Drop `app/components/renderers/<MyCheck>Renderer.vue` — it auto-loads by convention.
   - Add `checks.<my-check>.{title,description}` and `info.<my-check>.{concept,purpose,tips}` to both locales (`i18n/locales/{tr,en}.json`).
5. Make sure `npm run ci` is green before opening a PR.

### CI Pipeline

GitHub Actions [`ci.yml`](.github/workflows/ci.yml) runs:

```text
quality  → lint + format:check + typecheck + test + coverage
        ↓
build  + docs (parallel)
        ↓
e2e   (Playwright)
```

The pre-commit hook (Husky + lint-staged) runs ESLint + Prettier only on changed files.

---

## 📜 License

[MIT License](LICENSE). Commercial and personal use are free.

---

<div align="center">

**L00kout** · Makes websites transparent.

</div>
