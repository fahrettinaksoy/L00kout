<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const ranked = computed(() => props.data?.ranked)
const rank = computed<number | null>(() => props.data?.rank ?? null)
const history = computed<{ date: string; rank: number }[]>(() => props.data?.history ?? [])

const average = computed(() => {
  if (!history.value.length) return null
  const sum = history.value.reduce((acc, h) => acc + (h.rank || 0), 0)
  return Math.round(sum / history.value.length)
})

const best = computed(() =>
  history.value.length ? Math.min(...history.value.map((h) => h.rank)) : null,
)
const worst = computed(() =>
  history.value.length ? Math.max(...history.value.map((h) => h.rank)) : null,
)

const fmt = (n: number | null) => (n ? n.toLocaleString() : '—')

// Mini sparkline (svg path)
const sparkline = computed(() => {
  if (history.value.length < 2) return null
  const ranks = history.value
    .map((h) => h.rank)
    .slice()
    .reverse()
  const max = Math.max(...ranks)
  const min = Math.min(...ranks)
  const range = max - min || 1
  const w = 240,
    h = 40
  const step = w / (ranks.length - 1)
  const points = ranks.map((r, i) => {
    const x = i * step
    const y = h - ((r - min) / range) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return `M ${points.join(' L ')}`
})
</script>

<template>
  <div>
    <template v-if="ranked">
      <div class="d-flex align-end ga-2 mb-2">
        <div class="text-h4 font-weight-bold gradient-text">{{ fmt(rank) }}</div>
        <div class="text-caption text-medium-emphasis mb-1">{{ t('rank.current') }}</div>
      </div>

      <v-table v-if="history.length" density="compact" class="bg-transparent rank-table">
        <tbody>
          <tr v-if="average !== null">
            <td class="text-caption text-medium-emphasis">{{ t('rank.average') }}</td>
            <td class="text-right text-body-2 font-mono">{{ fmt(average) }}</td>
          </tr>
          <tr v-if="best !== null">
            <td class="text-caption text-medium-emphasis">{{ t('rank.best') }}</td>
            <td class="text-right text-body-2 font-mono">{{ fmt(best) }}</td>
          </tr>
          <tr v-if="worst !== null">
            <td class="text-caption text-medium-emphasis">{{ t('rank.worst') }}</td>
            <td class="text-right text-body-2 font-mono">{{ fmt(worst) }}</td>
          </tr>
        </tbody>
      </v-table>

      <div v-if="sparkline" class="sparkline-wrap mt-3">
        <svg :viewBox="`0 0 240 40`" preserveAspectRatio="none" class="sparkline">
          <path
            :d="sparkline"
            fill="none"
            stroke="rgb(var(--v-theme-primary))"
            stroke-width="1.5"
          />
        </svg>
        <div class="text-caption text-medium-emphasis text-center mt-1">
          {{ t('rank.history') }}
        </div>
      </div>
    </template>
    <div v-else class="text-caption text-medium-emphasis">{{ t('rank.notRanked') }}</div>
  </div>
</template>

<style scoped lang="scss">
.rank-table tr td {
  border-bottom: none !important;
  padding: 3px 0 !important;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
.sparkline-wrap {
  background: rgba(127, 127, 127, 0.06);
  border-radius: 6px;
  padding: 8px;
}
.sparkline {
  display: block;
  width: 100%;
  height: 40px;
}
</style>
