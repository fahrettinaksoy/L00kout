<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t, locale } = useI18n()

const sample = computed<any[]>(() => props.data?.sample ?? [])

const fmtDate = (s: string | null | undefined) => {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const short = (url: string) => {
  try {
    const u = new URL(url)
    return u.pathname + u.search
  } catch {
    return url
  }
}
</script>

<template>
  <div>
    <template v-if="data?.found">
      <div class="d-flex ga-2 mb-3">
        <v-chip size="small" variant="tonal" color="primary">
          <v-icon icon="mdi-link" start size="14" />
          {{ t('sitemap.url') }} · {{ data?.urlCount }}
        </v-chip>
        <v-chip v-if="data?.indexCount" size="small" variant="tonal">
          <v-icon icon="mdi-folder-multiple-outline" start size="14" />
          {{ t('sitemap.index') }} · {{ data?.indexCount }}
        </v-chip>
      </div>

      <div class="sm-grid">
        <div v-for="(u, i) in sample" :key="i" class="sm-cell">
          <div class="sm-loc text-truncate" :title="u.loc">{{ short(u.loc) }}</div>
          <div v-if="u.lastmod || u.changefreq || u.priority" class="sm-meta">
            <span v-if="u.lastmod" class="me-2">📅 {{ fmtDate(u.lastmod) }}</span>
            <span v-if="u.changefreq" class="me-2">🔄 {{ u.changefreq }}</span>
            <span v-if="u.priority">★ {{ u.priority }}</span>
          </div>
        </div>
      </div>
      <div class="text-caption text-medium-emphasis mt-2 text-truncate">{{ data?.source }}</div>
    </template>
    <div v-else class="text-caption text-medium-emphasis">{{ t('sitemap.notFound') }}</div>
  </div>
</template>

<style scoped lang="scss">
.sm-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 320px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .sm-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .sm-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .sm-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .sm-grid {
    grid-template-columns: 1fr;
  }
}
.sm-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.sm-loc {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.92);
}
.sm-meta {
  font-size: 0.66rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
