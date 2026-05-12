<script setup lang="ts">
const { all, categories, byCategory, categoryMeta } = useCheckRegistry()
const store = useResultsStore()
const { t } = useI18n()
const route = useRoute()
const activeCategory = useState<string>('activeCategory', () => 'all')

const target = computed(() => {
  const param = route.params.target as string | undefined
  return param ? decodeURIComponent(param) : store.target || ''
})
const siteUrl = computed(() => {
  if (!target.value) return ''
  return /^https?:\/\//i.test(target.value) ? target.value : `https://${target.value}`
})
const hostname = computed(() => {
  try {
    return new URL(siteUrl.value).hostname
  } catch {
    return target.value
  }
})
const faviconUrl = computed(() =>
  hostname.value
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname.value)}&sz=64`
    : '',
)
const faviconError = ref(false)
watch(faviconUrl, () => {
  faviconError.value = false
})

const stats = (catId: string) => {
  const ids = catId === 'all' ? all.map((c) => c.id) : byCategory(catId as any).map((c) => c.id)
  let success = 0,
    error = 0,
    loading = 0
  for (const id of ids) {
    const s = store.results[id]?.status
    if (s === 'success') success++
    else if (s === 'error') error++
    else if (s === 'loading') loading++
  }
  return { success, error, loading, total: ids.length }
}

const overallStats = computed(() => {
  const items = Object.values(store.results)
  return {
    success: items.filter((r) => r.status === 'success').length,
    error: items.filter((r) => r.status === 'error').length,
    loading: items.filter((r) => r.status === 'loading').length,
  }
})
</script>

<template>
  <div class="pa-4">
    <div v-if="target" class="target-card mb-4">
      <div class="text-overline text-medium-emphasis mb-2">{{ t('dashboard.targetLabel') }}</div>
      <div class="d-flex align-center ga-3">
        <div class="favicon-wrap">
          <img
            v-if="!faviconError"
            :src="faviconUrl"
            :alt="hostname"
            class="favicon"
            @error="faviconError = true"
          />
          <v-icon v-else icon="mdi-web" size="20" color="primary" />
        </div>
        <div class="flex-grow-1 min-width-0">
          <div class="text-h6 font-weight-bold text-truncate">{{ target }}</div>
          <a
            :href="siteUrl"
            target="_blank"
            rel="noopener"
            class="text-caption text-primary text-decoration-none d-inline-flex align-center"
          >
            <v-icon icon="mdi-open-in-new" size="12" class="me-1" />
            <span class="text-truncate">{{ siteUrl }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="text-overline text-medium-emphasis mb-2">{{ t('dashboard.overview') }}</div>
    <v-card variant="tonal" class="pa-3 mb-4">
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">{{ t('dashboard.success') }}</span>
        <v-chip size="x-small" color="success" variant="flat">{{ overallStats.success }}</v-chip>
      </div>
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="text-caption">{{ t('dashboard.running') }}</span>
        <v-chip size="x-small" color="info" variant="flat">{{ overallStats.loading }}</v-chip>
      </div>
      <div class="d-flex justify-space-between align-center">
        <span class="text-caption">{{ t('dashboard.error') }}</span>
        <v-chip size="x-small" color="error" variant="flat">{{ overallStats.error }}</v-chip>
      </div>
    </v-card>

    <div class="text-overline text-medium-emphasis mb-2">{{ t('dashboard.categories') }}</div>
    <v-list density="compact" nav>
      <v-list-item
        :active="activeCategory === 'all'"
        prepend-icon="mdi-view-grid"
        :title="t('dashboard.all')"
        @click="activeCategory = 'all'"
      >
        <template #append>
          <span class="text-caption text-medium-emphasis">
            {{ stats('all').success }}/{{ stats('all').total }}
          </span>
        </template>
      </v-list-item>
      <v-list-item
        v-for="cat in categories"
        :key="cat"
        :active="activeCategory === cat"
        :prepend-icon="categoryMeta[cat].icon"
        :title="t(`categories.${cat}`)"
        @click="activeCategory = cat"
      >
        <template #append>
          <span class="text-caption text-medium-emphasis">
            {{ stats(cat).success }}/{{ stats(cat).total }}
          </span>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped lang="scss">
.target-card {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(127, 127, 127, 0.18);
  a {
    display: block;
    max-width: 100%;
  }
}
.favicon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}
.favicon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  border-radius: 4px;
}
.min-width-0 {
  min-width: 0;
}
</style>
