<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const allow = computed<string[]>(() => props.data?.allow ?? [])
const disallow = computed<string[]>(() => props.data?.disallow ?? [])
const sitemaps = computed<string[]>(() => props.data?.sitemaps ?? [])

const tab = ref<'allow' | 'disallow' | 'sitemap'>('disallow')
const list = computed<string[]>(() => {
  if (tab.value === 'allow') return allow.value
  if (tab.value === 'sitemap') return sitemaps.value
  return disallow.value
})
</script>

<template>
  <div v-if="!data?.exists" class="text-caption text-medium-emphasis">
    {{ t('robots.notFound') }}
  </div>
  <div v-else>
    <div class="d-flex ga-2 mb-3">
      <v-chip
        size="small"
        :color="tab === 'allow' ? 'success' : undefined"
        :variant="tab === 'allow' ? 'flat' : 'tonal'"
        @click="tab = 'allow'"
      >
        <v-icon icon="mdi-check" start size="14" />
        {{ t('robots.allow') }} · {{ allow.length }}
      </v-chip>
      <v-chip
        size="small"
        :color="tab === 'disallow' ? 'error' : undefined"
        :variant="tab === 'disallow' ? 'flat' : 'tonal'"
        @click="tab = 'disallow'"
      >
        <v-icon icon="mdi-close" start size="14" />
        {{ t('robots.disallow') }} · {{ disallow.length }}
      </v-chip>
      <v-chip
        size="small"
        :color="tab === 'sitemap' ? 'info' : undefined"
        :variant="tab === 'sitemap' ? 'flat' : 'tonal'"
        @click="tab = 'sitemap'"
      >
        <v-icon icon="mdi-sitemap" start size="14" />
        {{ t('robots.sitemap') }} · {{ sitemaps.length }}
      </v-chip>
    </div>

    <div v-if="list.length" class="rb-grid">
      <div v-for="(p, i) in list" :key="i" class="rb-cell text-truncate" :title="p">{{ p }}</div>
    </div>
    <div v-else class="text-caption text-medium-emphasis">—</div>
  </div>
</template>

<style scoped lang="scss">
.rb-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 320px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .rb-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .rb-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .rb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .rb-grid {
    grid-template-columns: 1fr;
  }
}
.rb-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
</style>
