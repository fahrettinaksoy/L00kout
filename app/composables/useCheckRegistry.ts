import type { CheckMeta, CheckCategory } from '~/types/check'

export const checkRegistry: CheckMeta[] = [
  // ── SECURITY ──────────────────────────────────────────────
  {
    id: 'ssl',
    icon: 'mdi-lock-check',
    category: 'security',
    endpoint: '/api/checks/ssl',
    estimatedMs: 4000,
  },
  {
    id: 'http-security',
    icon: 'mdi-shield-lock',
    category: 'security',
    endpoint: '/api/checks/http-security',
    estimatedMs: 1800,
  },
  {
    id: 'firewall',
    icon: 'mdi-wall-fire',
    category: 'security',
    endpoint: '/api/checks/firewall',
    estimatedMs: 2000,
  },
  {
    id: 'security-txt',
    icon: 'mdi-file-document-outline',
    category: 'security',
    endpoint: '/api/checks/security-txt',
    estimatedMs: 1500,
  },
  {
    id: 'cookies',
    icon: 'mdi-cookie',
    category: 'security',
    endpoint: '/api/checks/cookies',
    estimatedMs: 1500,
  },

  // ── DNS ───────────────────────────────────────────────────
  { id: 'dns', icon: 'mdi-dns', category: 'dns', endpoint: '/api/checks/dns', estimatedMs: 2500 },
  {
    id: 'dnssec',
    icon: 'mdi-dns-outline',
    category: 'dns',
    endpoint: '/api/checks/dnssec',
    estimatedMs: 2000,
  },
  {
    id: 'mail-config',
    icon: 'mdi-email-check',
    category: 'dns',
    endpoint: '/api/checks/mail-config',
    estimatedMs: 1800,
  },
  {
    id: 'whois',
    icon: 'mdi-card-account-details',
    category: 'dns',
    endpoint: '/api/checks/whois',
    estimatedMs: 3000,
  },
  {
    id: 'subdomains',
    icon: 'mdi-family-tree',
    category: 'dns',
    endpoint: '/api/checks/subdomains',
    estimatedMs: 6000,
  },
  {
    id: 'hostnames',
    icon: 'mdi-server',
    category: 'network',
    endpoint: '/api/checks/hostnames',
    estimatedMs: 2000,
  },

  // ── NETWORK ───────────────────────────────────────────────
  {
    id: 'location',
    icon: 'mdi-map-marker',
    category: 'network',
    endpoint: '/api/checks/location',
    estimatedMs: 2000,
  },
  {
    id: 'ports',
    icon: 'mdi-lan-pending',
    category: 'network',
    endpoint: '/api/checks/ports',
    estimatedMs: 6000,
    heavy: true,
  },
  {
    id: 'trace-route',
    icon: 'mdi-routes',
    category: 'network',
    endpoint: '/api/checks/trace-route',
    estimatedMs: 8000,
    heavy: true,
  },
  {
    id: 'status',
    icon: 'mdi-pulse',
    category: 'network',
    endpoint: '/api/checks/status',
    estimatedMs: 1200,
  },

  // ── PERFORMANCE ───────────────────────────────────────────
  {
    id: 'quality',
    icon: 'mdi-speedometer',
    category: 'performance',
    endpoint: '/api/checks/quality',
    estimatedMs: 15000,
    heavy: true,
    requiresKey: true,
  },
  {
    id: 'carbon',
    icon: 'mdi-leaf',
    category: 'performance',
    endpoint: '/api/checks/carbon',
    estimatedMs: 2000,
  },
  {
    id: 'screenshot',
    icon: 'mdi-camera',
    category: 'performance',
    endpoint: '/api/checks/screenshot',
    estimatedMs: 8000,
    heavy: true,
  },

  // ── METADATA ──────────────────────────────────────────────
  {
    id: 'headers',
    icon: 'mdi-file-tree',
    category: 'metadata',
    endpoint: '/api/checks/headers',
    estimatedMs: 1200,
  },
  {
    id: 'tech-stack',
    icon: 'mdi-toolbox',
    category: 'metadata',
    endpoint: '/api/checks/tech-stack',
    estimatedMs: 4000,
    heavy: true,
  },
  {
    id: 'social-tags',
    icon: 'mdi-share-variant',
    category: 'metadata',
    endpoint: '/api/checks/social-tags',
    estimatedMs: 1500,
  },
  {
    id: 'redirects',
    icon: 'mdi-arrow-right-bottom',
    category: 'metadata',
    endpoint: '/api/checks/redirects',
    estimatedMs: 2000,
  },

  // ── CRAWLING ──────────────────────────────────────────────
  {
    id: 'robots-txt',
    icon: 'mdi-robot',
    category: 'crawling',
    endpoint: '/api/checks/robots-txt',
    estimatedMs: 1500,
  },
  {
    id: 'sitemap',
    icon: 'mdi-sitemap',
    category: 'crawling',
    endpoint: '/api/checks/sitemap',
    estimatedMs: 2000,
  },
  {
    id: 'linked-pages',
    icon: 'mdi-link-variant',
    category: 'crawling',
    endpoint: '/api/checks/linked-pages',
    estimatedMs: 2500,
  },
  {
    id: 'archives',
    icon: 'mdi-history',
    category: 'crawling',
    endpoint: '/api/checks/archives',
    estimatedMs: 2500,
  },

  // ── REPUTATION ────────────────────────────────────────────
  {
    id: 'rank',
    icon: 'mdi-trophy',
    category: 'reputation',
    endpoint: '/api/checks/rank',
    estimatedMs: 1500,
  },
  {
    id: 'block-lists',
    icon: 'mdi-block-helper',
    category: 'reputation',
    endpoint: '/api/checks/block-lists',
    estimatedMs: 4000,
  },
  {
    id: 'threats',
    icon: 'mdi-alert-octagon',
    category: 'reputation',
    endpoint: '/api/checks/threats',
    estimatedMs: 3000,
  },
  {
    id: 'shodan',
    icon: 'mdi-radar',
    category: 'reputation',
    endpoint: '/api/checks/shodan',
    estimatedMs: 3000,
    requiresKey: true,
  },
  {
    id: 'malware',
    icon: 'mdi-bug',
    category: 'reputation',
    endpoint: '/api/checks/malware',
    estimatedMs: 2500,
    requiresKey: true,
  },
]

export const categoryMeta: Record<CheckCategory, { icon: string; color: string }> = {
  security: { icon: 'mdi-shield-half-full', color: 'error' },
  dns: { icon: 'mdi-dns', color: 'info' },
  network: { icon: 'mdi-lan', color: 'secondary' },
  performance: { icon: 'mdi-speedometer', color: 'warning' },
  metadata: { icon: 'mdi-information', color: 'primary' },
  crawling: { icon: 'mdi-robot', color: 'success' },
  reputation: { icon: 'mdi-trophy', color: 'warning' },
}

export const useCheckRegistry = () => {
  const all = checkRegistry
  const byCategory = (cat: CheckCategory) => all.filter((c) => c.category === cat)
  const byId = (id: string) => all.find((c) => c.id === id)
  const categories = Object.keys(categoryMeta) as CheckCategory[]
  return { all, byCategory, byId, categories, categoryMeta }
}
