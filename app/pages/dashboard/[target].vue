<script setup lang="ts">
import type { CheckCategory } from '~/types/check'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const target = computed(() => decodeURIComponent(route.params.target as string))
const { all, byCategory, categoryMeta } = useCheckRegistry()
const { run, cancel } = useCheckRunner()
const store = useResultsStore()
const activeCategory = useState<string>('activeCategory', () => 'all')

onMounted(() => {
  if (target.value) run(target.value)
})

onBeforeUnmount(cancel)

const visibleChecks = computed(() => {
  if (activeCategory.value === 'all') return all
  return byCategory(activeCategory.value as CheckCategory)
})

const activeMeta = computed(() =>
  activeCategory.value === 'all' ? null : categoryMeta[activeCategory.value as CheckCategory],
)

const progress = computed(() => {
  const total = store.total
  if (!total) return 0
  return Math.round((store.completed / total) * 100)
})
</script>

<template>
  <div>
    <div class="sticky-bar d-flex align-center mb-4 ga-3 flex-wrap border-0">
      <v-icon :icon="activeMeta?.icon ?? 'mdi-view-grid'" size="20" />
      <span class="text-h6 font-weight-medium">
        {{ activeCategory === 'all' ? $t('dashboard.all') : $t(`categories.${activeCategory}`) }}
      </span>
      <v-chip size="small" variant="tonal">{{ visibleChecks.length }}</v-chip>
      <v-spacer />
      <div class="d-flex align-center ga-3">
        <v-progress-circular :model-value="progress" :size="40" :width="4" color="primary">
          <span class="text-caption">{{ progress }}%</span>
        </v-progress-circular>
        <div>
          <div class="text-caption text-medium-emphasis">{{ $t('dashboard.completed') }}</div>
          <div class="text-body-2 font-weight-medium">
            {{ store.completed }} / {{ store.total }}
          </div>
        </div>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" @click="run(target)">
          {{ $t('common.rerun') }}
        </v-btn>
      </div>
    </div>

    <div class="l00k-grid">
      <CheckCard v-for="meta in visibleChecks" :key="meta.id" :meta="meta" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sticky-bar {
  position: -webkit-sticky;
  position: sticky;
  top: 64px;
  z-index: 5;
  background: rgb(var(--v-theme-background));
  margin: -24px -24px 16px;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(127, 127, 127, 0.18);
}
</style>
