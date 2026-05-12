# L00kout

> Bir web sitesini saniyeler içinde **31 güvenlik, ağ ve içerik kontrolü** ile analiz eden açık kaynak, kurumsal seviye bir araçtır.

L00kout, herhangi bir domain veya URL hakkında DNS, SSL/TLS, HTTP, ağ, performans, içerik ve itibar düzeyinde bilgi toplayan tek-ekran dashboard uygulamasıdır. Tüm kontroller paralel yürür, sonuçlar geldikçe canlı olarak ekrana akar; her kart kendi yenileme, iptal ve ham veri görünümünü kendisi yönetir.

Hedef kitle; bir alan adının güvenlik, altyapı ve itibar profilini hızlıca görmek isteyen geliştirici, SRE, güvenlik araştırmacısı ve teknik içerik üreticileridir. Araç yerelde Docker'sız çalışır, ücretsiz veri kaynaklarına graceful fallback yapar ve dış API anahtarları olmadan da tüm kategorileri eksiksiz doldurur. Toplanan veriler kalıcı bir veritabanına yazılmaz — her analiz bağımsız, isteğe bağlı tetiklenir.

> 🌐 English version: [README.md](README.md)

---

## ✨ Öne Çıkanlar

- 🚀 **31 kontrol, tek tıkla** — DNS, SSL/TLS, HTTP, ağ, içerik, performans, itibar.
- 🌐 **İki dilli arayüz** — Türkçe + İngilizce; tarayıcı dilini algılar, seçim `localStorage`'da kalır.
- 🎨 **Açık & koyu tema** — OS tercihini takip eder; kullanıcı seçimi kalıcı.
- 📊 **Geniş grid layout** — Tüm sonuçlar tek bakışta görünür.
- 🔍 **Per-check bilgi paneli** — "Bu kontrol nedir?", "Neden önemli?", "Nelere bakmalı?" her kart için ayrı ayrı.
- ♻️ **Kart başına yenileme** — Bir kontrolü tüm batch'i baştan başlatmadan yeniden çalıştır.
- 🗺️ **İnteraktif harita** — Sunucu konumu OpenStreetMap üzerinde.
- 🌍 **Sıfır API key ile çalışır** — Her kontrolün ücretsiz fallback'i var.
- 📱 **Tam responsive** — Mobile-first, 480px → 5K.

---

## 🛡️ Üretime Hazır Altyapı

Proje production ortamı için hazırlanmıştır:

| Konu                    | Uygulama                                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSRF koruması**       | `assertPublicTarget()` hostname'i resolve eder, RFC 1918 / loopback / link-local / cloud-metadata / IPv4-mapped private aralıklarındaki adresleri her dış istekten önce reddeder. |
| **Rate limiting**       | `/api/checks/**` üzerinde IP başına sliding-window limiter; `X-RateLimit-*` header'ları döner. Env: `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`.                                     |
| **Error taxonomy**      | Tüm hatalar kapalı bir `ErrorCode` setine map'lenir (`SSRF_BLOCKED`, `UPSTREAM_TIMEOUT`, `RATE_LIMITED`, …). İstemci kodu i18n anahtarı olarak kullanır — ham metin sızmaz.       |
| **Structured logging**  | Production'da NDJSON, dev'de okunabilir. Her check için süre + outcome + hostname.                                                                                                |
| **Sentry**              | `SENTRY_DSN` set edilince otomatik aktif; sadece beklenmedik `INTERNAL_ERROR`'lar raporlanır (upstream gürültüsü gönderilmez).                                                    |
| **Prometheus metrics**  | `/api/metrics` (bearer token korumalı): check run'ları, latency histogram, cache hit/miss, rate-limit drop'ları.                                                                  |
| **Security headers**    | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy — `nuxt-security` üzerinden.                                                              |
| **Input validation**    | `parseTarget()` katı IPv4 (0-255 octet), IPv6, RFC 1035 hostname, max uzunluk doğrulaması yapar. Client ve server tek kaynaktan kullanır.                                         |
| **Upstream validation** | Üçüncü taraf JSON yanıtları Zod ile parse edilir. Şema uyuşmazlığı `UPSTREAM_HTTP_ERROR` olarak yüzeyleşir ve raporlanır.                                                         |
| **Caching**             | Stabil veriler (WHOIS, SSL Labs, geolocation, country info) Nitro storage üzerinde TTL'li olarak cache'lenir.                                                                     |
| **Adaptive scheduling** | Worker-pool scheduler; check'leri `estimatedMs` azalan sıralı çalıştırır. Wall-clock ≈ `max(individual)`.                                                                         |

---

## 🧩 Kontrol Kategorileri

L00kout 7 kategori altında 31 kontrol gerçekleştirir:

### 🛡️ Güvenlik (5)

| Kontrol                       | Açıklama                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSL Sertifikası**           | Sertifika detayları, TLS protokolü, cipher, ALPN, OCSP, Forward Secrecy, Session Resumption ve SSL Labs notu                                  |
| **HTTP Güvenlik Header'ları** | CSP, HSTS (preload dahil), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin politikaları + A-F notu |
| **WAF Tespiti**               | Cloudflare, AWS WAF, Sucuri, Fastly, Imperva, Akamai, F5 BIG-IP                                                                               |
| **Security.txt**              | `/.well-known/security.txt` ve sorumlu açıklama politikası                                                                                    |
| **Çerez Analizi**             | HttpOnly, Secure, SameSite, persistent flag analizi                                                                                           |

### 🌐 DNS (5)

| Kontrol                    | Açıklama                                                                                                 |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| **DNS Kayıtları**          | A, AAAA, MX, NS, CNAME, SOA, TXT, SRV + nameserver DoH desteği + TXT sınıflandırma (SPF/DMARC/DKIM/BIMI) |
| **DNSSEC**                 | DNSKEY, DS, RRSIG kayıtları + DNS query flag'leri (RD/RA/TC/AD/CD)                                       |
| **E-posta Konfigürasyonu** | SPF / DKIM / DMARC / MX skoru                                                                            |
| **WHOIS**                  | RDAP protokolü üzerinden domain kayıt sahibi, registrar, oluşturma, sona erme tarihleri                  |
| **Subdomain'ler**          | Certificate Transparency logları + hackertarget.com ile subdomain keşfi                                  |

### 🔌 Ağ (5)

| Kontrol           | Açıklama                                                     |
| ----------------- | ------------------------------------------------------------ |
| **Sunucu Konumu** | IPv4/IPv6, coğrafi konum, ülke, ISP, ASN + interaktif harita |
| **Host Adları**   | Reverse DNS (PTR) sorgusu — IP başına hostname'ler           |
| **Açık Portlar**  | 17 yaygın TCP portu (SSH, HTTP, SMTP, MySQL, Redis, vb.)     |
| **Traceroute**    | Hedef sunucuya kadar olan ağ yolu ve hop bilgileri           |
| **Sunucu Durumu** | HTTP status kodu ve yanıt süresi                             |

### ⚡ Performans (3)

| Kontrol              | Açıklama                                                                       |
| -------------------- | ------------------------------------------------------------------------------ |
| **Lighthouse Skoru** | Performance, Accessibility, Best Practices, SEO + Mozilla Observatory fallback |
| **Karbon Ayak İzi**  | Tahmini CO₂ emisyonu — Website Carbon API + yerel tahmin fallback              |
| **Ekran Görüntüsü**  | Sitesinin headless tarayıcı görüntüsü (Microlink / thum.io / ScreenshotOne)    |

### 📋 Metadata (4)

| Kontrol                     | Açıklama                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------- |
| **HTTP Header'ları**        | Tüm response header'larının detaylı listesi                                        |
| **Teknoloji Stack'i**       | Framework, CMS, CDN, analytics, payment, security teknolojileri tespiti (20+ imza) |
| **Sosyal Medya Etiketleri** | Open Graph, Twitter Cards, canonical URL + önizleme görseli                        |
| **Yönlendirmeler**          | HTTP redirect zinciri ve final URL                                                 |

### 🤖 Crawling (4)

| Kontrol             | Açıklama                                        |
| ------------------- | ----------------------------------------------- |
| **robots.txt**      | Allow, Disallow, Sitemap kuralları              |
| **Sitemap**         | Per-URL lastmod, changefreq, priority detayları |
| **Bağlantılar**     | Sayfadaki dahili ve harici linkler              |
| **Wayback Machine** | archive.org'daki tarihsel snapshot'lar          |

### 🏆 İtibar (5)

| Kontrol                 | Açıklama                                                                          |
| ----------------------- | --------------------------------------------------------------------------------- |
| **Global Sıralama**     | Tranco listesindeki popülerlik + sparkline tarihsel grafik                        |
| **Engelleme Listeleri** | 12 DNS resolver (AdGuard, Cloudflare, Quad9, OpenDNS, vb.) ile blocklist kontrolü |
| **Tehdit Tespiti**      | URLhaus + PhishReport tehdit istihbaratı                                          |
| **Shodan**              | Açık servisler, CVE'ler ve banner bilgileri (InternetDB ücretsiz)                 |
| **Malware Taraması**    | URLhaus + ThreatFox + Google Safe Browsing                                        |

---

## 🛠️ Teknoloji Stack'i

| Katman                  | Teknoloji                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **Frontend**            | Nuxt 4, Vue 3 (Composition API + `<script setup>`), TypeScript strict mode           |
| **UI**                  | Vuetify 3, Material Design Icons                                                     |
| **State**               | Pinia + Nuxt `useState`                                                              |
| **i18n**                | `@nuxtjs/i18n` (TR + EN)                                                             |
| **Backend**             | Nitro (Nuxt'ın embed server'ı)                                                       |
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

## 📦 Kurulum

### Önkoşullar

- **Node.js 22+** (repo'da `.nvmrc` var: `nvm use`)
- **npm 10+**

### Adımlar

```bash
# 1) Bağımlılıkları yükle
npm ci

# 2) (Opsiyonel) Ücretsiz API key'leri ayarla
cp .env.example .env
# .env dosyasını düzenle

# 3) Geliştirme sunucusunu başlat
npm run dev
```

Sunucu `{BASE_URL}` (varsayılan dev portu) üzerinde açılır. İlk hedef bir domain (örn. `github.com`) girerek başlayabilirsin.

---

## 🚀 Komutlar

```bash
# Geliştirme & build
npm run dev               # Geliştirme sunucusu ({BASE_URL})
npm run build             # Production build (.output/)
npm run preview           # Build'i lokal önizleme
npm run generate          # Statik build

# Kod kalitesi
npm run lint              # ESLint
npm run lint:fix          # ESLint + auto-fix
npm run format            # Prettier write
npm run format:check      # Prettier check
npm run typecheck         # nuxt typecheck (vue-tsc)

# Test
npm run test              # Vitest (unit) — 114 test
npm run test:watch        # Vitest watch
npm run test:coverage     # Vitest + v8 coverage (%60 threshold)
npm run test:e2e          # Playwright E2E (landing + a11y + security + rate-limit)
npm run test:e2e:install  # Chromium browser indir

# Dokümantasyon & bundle
npm run docs              # typedoc → docs/api/
npm run size              # size-limit bundle budget kontrolü
npm run size:why          # Bundle inspector (hangi paket ne kadar yer kaplıyor)

# Toplu CI
npm run ci                # lint + format:check + typecheck + test
```

---

## ⚙️ Yapılandırma (.env)

Tüm değişkenler **opsiyoneldir**. Hiçbiri tanımlanmasa bile L00kout tüm kontrolleri ücretsiz fallback'lerle çalıştırır.

### Üçüncü taraf API anahtarları (opsiyonel)

```bash
# Google PageSpeed Insights — rate limit'i artırır
PAGESPEED_API_KEY=

# Shodan — key'siz InternetDB kullanılır
SHODAN_API_KEY=

# Google Safe Browsing — URLhaus + ThreatFox fallback'i mevcut
GOOGLE_SAFE_BROWSING_KEY=

# ScreenshotOne — key'siz Microlink / thum.io fallback'i mevcut
SCREENSHOT_API_KEY=
```

### Operasyonel ayarlar

```bash
# Sentry — DSN boşsa kapalı
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1

# CORS — production'da kendi origin'inize çekin
API_CORS_ORIGIN=*

# Rate limiting (/api/checks/** için, IP başına sliding window)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=60

# Prometheus scrape token — set edilmezse /api/metrics 404 döner
METRICS_TOKEN=

# Client batching / timeout (public runtimeConfig)
NUXT_PUBLIC_API_TIMEOUT_MS=40000
NUXT_PUBLIC_REQUEST_BATCH_SIZE=5

# E2E ayarları (opsiyonel)
PLAYWRIGHT_PORT=3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100
```

### Anahtar almak

| Servis           | URL                                                                          | Ücretsiz Tier                 |
| ---------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| Google PageSpeed | https://console.cloud.google.com/apis/library/pagespeedonline.googleapis.com | 25,000 sorgu/gün              |
| Shodan           | https://account.shodan.io/register                                           | Sınırlı (InternetDB sınırsız) |
| Safe Browsing    | https://console.cloud.google.com/apis/library/safebrowsing.googleapis.com    | 10,000 sorgu/gün              |
| ScreenshotOne    | https://screenshotone.com/                                                   | 100 görüntü/ay                |

---

## 🏗️ Mimari

```
shared/                              # Client + server arası ortak kod
  url.ts                             # parseTarget + IP detection (tek kaynak)
  types/checks.ts                    # Public endpoint response şekilleri

server/
  api/
    checks/*.get.ts                  # 31 endpoint; her biri defineCheck() ile sarılı
    metrics.get.ts                   # Prometheus scrape (bearer korumalı)
  middleware/
    rate-limit.ts                    # /api/checks/** üzerinde per-IP limit
  plugins/
    00.sentry.ts                     # Sentry init (DSN yoksa no-op)
  utils/
    defineCheck.ts                   # Wrapper: validation + SSRF + timing + log + metrics
    target.ts                        # getTarget(event), fetchWithTimeout
    ssrf.ts                          # assertPublicTarget() — RFC 1918 + IPv6 + metadata guard
    errors.ts                        # AppError taxonomy + toH3Error (sızıntısız)
    logger.ts                        # consola — prod'da NDJSON
    sentry.ts                        # Lazy init
    metrics.ts                       # prom-client counter'ları + histogram
    cache.ts                         # cached(bucket, parts, ttl, loader)
    rateLimit.ts                     # Sliding-window
    upstream.ts                      # fetchJson<T>(url, zodSchema) + fetchOrThrow
    scoring.ts, dns.ts,              # Pure helper'lar (unit-test'li)
    httpSecurity.ts

app/
  pages/
    index.vue                        # Landing — URL input
    dashboard/[target].vue           # Dashboard — 31 check grid
  layouts/
    default.vue                      # Landing layout
    dashboard.vue                    # App bar + sidebar + main
  components/
    CheckCard.vue                    # ~60 LOC composition wrapper
    CheckCardHeader.vue              # Avatar + başlık + status + aksiyonlar
    CheckCardBody.vue                # Status FSM → skeleton/loading/error/data
    CheckCardFooter.vue              # Süre + raw-JSON toggle
    CheckResultRenderer.vue          # Auto-loads renderers/*Renderer.vue (import.meta.glob)
    renderers/                       # 32 spesifik renderer
  composables/
    useCheckRegistry.ts              # 31 check'in merkezi metadata'sı
    useCheckRunner.ts                # Worker-pool scheduler + AbortController + i18n hatalar
    useCheckError.ts                 # CheckErrorPayload → i18n format
    useCheckStatus.ts                # statusColor/Icon, formatDuration, path→id (pure)
    useTarget.ts                     # Shared parseTarget re-export
    useInfoDrawer.ts                 # Drawer state
  stores/
    results.ts                       # Pinia — per-check sonuç + state
  types/check.ts                     # CheckMeta, CheckResult, CheckErrorPayload

i18n/locales/                        # tr.json + en.json (+ errors.* bloğu)
tests/                               # Vitest unit tests (URL, SSRF, errors, scoring, scheduling…)
e2e/                                 # Playwright (landing, a11y, security, rate-limit)
docs/
  adr/                               # Architecture Decision Records (0001–0004)
  api/                               # typedoc generated (gitignored)
.github/workflows/ci.yml             # quality → build/docs (paralel) → e2e
```

### Tasarım Prensipleri

1. **Composition over inheritance** — `<script setup>` + composables her yerde.
2. **Tek kaynak ilkesi** — `parseTarget` shared/, error code'lar errors.ts, scoring saf modüllerde.
3. **`defineCheck` decorator pattern** — endpoint'ler sadece domain logic'i ile ilgilenir; validation/SSRF/timing/log/metrics merkezi.
4. **Closed error taxonomy** — `ErrorCode` union + `data.code` + i18n key resolution. İstemciye ham metin sızmaz.
5. **Convention over configuration** — renderer'lar dosya adından otomatik kayıtlı.
6. **Defense in depth** — input validation → SSRF guard → rate limit → CSP → output sanitization.
7. **Graceful degradation** — her dış API için fallback; hiçbir kart "boş" kalmaz.
8. **Observability built-in** — log + metric + Sentry ilk gün kuruludur.

---

## 🔌 API Kullanımı

Tüm check endpoint'leri standalone REST API olarak da kullanılabilir:

```bash
curl '{BASE_URL}/api/checks/ssl?url=github.com'
curl '{BASE_URL}/api/checks/dns?url=github.com'
curl '{BASE_URL}/api/checks/subdomains?url=github.com'
```

### Header'lar

Her `/api/checks/**` yanıtı şu header'ları içerir:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1747059600
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

### Hata formatı

```jsonc
// HTTP 400 — SSRF_BLOCKED örneği
{
  "statusCode": 400,
  "statusMessage": "SSRF_BLOCKED",
  "data": {
    "code": "SSRF_BLOCKED",
    "context": { "hostname": "127.0.0.1" },
  },
}
```

İstemci `data.code`'u i18n anahtarı olarak kullanır: `t('errors.SSRF_BLOCKED')`.

### Prometheus metrics

```bash
curl -H "Authorization: Bearer $METRICS_TOKEN" {BASE_URL}/api/metrics
```

Sunulan metrikler:

```text
l00kout_check_runs_total{id, outcome}
l00kout_check_duration_ms{id, outcome}     # histogram
l00kout_upstream_errors_total{id, code}
l00kout_rate_limit_total
l00kout_cache_total{bucket, outcome}        # hit / miss
# + default process / event-loop / GC metrikleri
```

---

## 🎨 Tema ve Dil

### Tema

- **Varsayılan:** OS tercihi (`prefers-color-scheme`)
- **Manuel:** Sağ üstteki ☀️/🌙 butonu
- **Saklama:** `localStorage.l00kout_theme`
- **Renkler:** Dark `#0B0F17 / #5B8DEF` · Light `#F8FAFC / #3B82F6`

### Dil

- **Varsayılan:** `navigator.language` (tr/en arası seçim, fallback: tr)
- **Manuel:** Sağ üstteki bayrak (🇹🇷/🇬🇧)
- **Saklama:** `localStorage.l00kout_locale`
- **Çevirilen:** ~265 anahtar (UI + 31 check title/description + her check için info + 15 error code)

---

## 🌍 Ücretsiz Veri Kaynakları

L00kout, hiçbir paid API'ye bağımlı değildir.

| Kategori     | Servis                                           |
| ------------ | ------------------------------------------------ |
| Geolocation  | ip-api.com (45 req/min)                          |
| Country data | restcountries.com                                |
| WHOIS        | rdap.org (IANA bootstrap)                        |
| Subdomain    | crt.sh + hackertarget.com                        |
| Reverse DNS  | Node.js `dns.reverse()`                          |
| Threats      | URLhaus + ThreatFox (abuse.ch)                   |
| Exposure     | Shodan InternetDB                                |
| Quality      | Google PageSpeed (25k/gün) + Mozilla Observatory |
| Carbon       | Website Carbon API + yerel tahmin                |
| Screenshot   | Microlink + thum.io                              |
| Archive      | Wayback Machine CDX API                          |
| Ranking      | Tranco list API                                  |
| Map          | OpenStreetMap embed                              |

---

## 🧪 Test Kapsamı

| Tür                    | Sayı      | Kapsam                                                                                                                                                                       |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit (Vitest)**      | 114 test  | URL parsing, SSRF (IPv4 CIDR'leri, IPv6, metadata), error taxonomy, rate limiter, scoring, DNS sınıflandırma, HSTS parsing, adaptive scheduling, status/duration helper'ları |
| **E2E (Playwright)**   | 9 senaryo | Landing render, dashboard navigation, security headers (CSP/HSTS/XFO), rate-limit header'ları, SSRF guard, URL_REQUIRED, metrics 404 (token yokken)                          |
| **A11y (axe-core)**    | 2 sayfa   | Landing + dashboard WCAG 2.0/2.1 A + AA ihlal sıfır assertion'u                                                                                                              |
| **Bundle budgets**     | 3 hedef   | Landing first-load ≤200KB gz, dashboard first-load ≤250KB gz, shared chunks ≤350KB gz                                                                                        |
| **Coverage threshold** | %60       | lines / functions / branches / statements (PR'da düşmesi fail)                                                                                                               |

---

## 📐 Mimari Kararlar (ADR)

Önemli kararlar [docs/adr/](docs/adr/) altında belgelenir:

- [0001 — defineCheck wrapper](docs/adr/0001-defineCheck-wrapper.md) — endpoint cross-cutting concern'leri
- [0002 — Error code taxonomy + i18n](docs/adr/0002-error-code-taxonomy.md) — kapalı hata seti + lokalizasyon
- [0003 — Zod upstream validation](docs/adr/0003-zod-upstream-validation.md) — şema doğrulama stratejisi
- [0004 — Convention-based renderer registry](docs/adr/0004-convention-based-renderer-registry.md) — otomatik renderer yükleme

---

## 🤝 Katkıda Bulunma

1. Fork + clone.
2. `npm ci`.
3. `npm run dev`.
4. **Yeni bir kontrol eklemek için:**
   - `server/api/checks/<my-check>.get.ts` oluştur — `defineCheck({...})` kullan, dış URL fetch ediyorsan `ssrfGuard: true` ekle.
   - `app/composables/useCheckRegistry.ts`'e metadata satırı ekle.
   - (Opsiyonel) `app/components/renderers/<MyCheck>Renderer.vue` koy — convention ile otomatik yüklenir.
   - Her iki locale (`i18n/locales/{tr,en}.json`) dosyasına `checks.<my-check>.{title,description}` ve `info.<my-check>.{concept,purpose,tips}` ekle.
5. PR açmadan önce `npm run ci` yeşil dönsün.

### CI Pipeline

GitHub Actions [`ci.yml`](.github/workflows/ci.yml) şu aşamaları yürütür:

```text
quality  → lint + format:check + typecheck + test + coverage
        ↓
build  + docs (paralel)
        ↓
e2e   (Playwright)
```

Pre-commit hook'u (Husky + lint-staged) sadece değişen dosyaları ESLint + Prettier'dan geçirir.

---

## 📜 Lisans

[MIT lisansı](LICENSE). Ticari ve kişisel kullanım serbesttir.

---

<div align="center">

**L00kout** · Web sitelerini şeffaflaştırır.

</div>
