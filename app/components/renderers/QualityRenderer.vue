<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const scoreColor = (s: number | undefined) => {
  if (typeof s !== 'number') return 'grey'
  if (s >= 90) return 'success'
  if (s >= 50) return 'warning'
  return 'error'
}

const gradeColor = (g: string | null | undefined): string => {
  if (!g) return 'grey'
  if (g.startsWith('A')) return 'success'
  if (g.startsWith('B')) return 'info'
  if (g.startsWith('C')) return 'warning'
  return 'error'
}

const scores = computed(() => {
  const s = props.data?.scores ?? {}
  return [
    { key: 'performance', label: 'Performance' },
    { key: 'accessibility', label: 'Accessibility' },
    { key: 'bestPractices', label: 'Best Practices' },
    { key: 'seo', label: 'SEO' },
  ].map((x) => ({ ...x, value: s[x.key] }))
})

const isLighthouse = computed(() => props.data?.source === 'lighthouse')
const isObservatory = computed(() => props.data?.source === 'mozilla-observatory')
</script>

<template>
  <div v-if="!data?.available" class="not-avail">
    <v-icon icon="mdi-key-alert" size="20" color="warning" class="me-2" />
    <div>
      <div class="text-body-2 font-weight-medium">
        {{ data?.status === 429 ? t('external.rateLimited') : t('external.keyRequired') }}
      </div>
      <div class="text-caption text-medium-emphasis">{{ data?.hint || t('external.keyHint') }}</div>
    </div>
  </div>

  <div v-else-if="isLighthouse">
    <div class="q-grid">
      <div v-for="s in scores" :key="s.key" class="q-cell">
        <v-avatar :color="scoreColor(s.value)" size="44" variant="flat">
          <span class="text-h6 font-weight-bold">{{ s.value ?? '—' }}</span>
        </v-avatar>
        <div class="q-label">{{ s.label }}</div>
      </div>
    </div>
    <div class="text-caption text-medium-emphasis mt-2">via Lighthouse</div>
  </div>

  <div v-else-if="isObservatory" class="obs-block">
    <div class="d-flex align-center ga-3 mb-2">
      <v-avatar :color="gradeColor(data?.observatory?.grade)" size="44" variant="flat">
        <span class="text-h6 font-weight-bold">{{ data?.observatory?.grade }}</span>
      </v-avatar>
      <div>
        <div class="text-h6 font-weight-bold">{{ data?.observatory?.score }}/100</div>
        <div class="text-caption text-medium-emphasis">
          {{ data?.observatory?.testsPassed }}/{{ data?.observatory?.testsQuantity }} test passed
        </div>
      </div>
    </div>
    <div class="text-caption text-medium-emphasis">via Mozilla Observatory · {{ data?.hint }}</div>
  </div>
</template>

<style scoped lang="scss">
.q-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 760px) {
  .q-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 380px) {
  .q-grid {
    grid-template-columns: 1fr;
  }
}
.q-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 10px 6px;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.q-label {
  margin-top: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.85);
}
.not-avail {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.22);
}
.obs-block {
  padding: 12px;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
</style>
