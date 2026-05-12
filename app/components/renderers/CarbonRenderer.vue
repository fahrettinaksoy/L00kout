<script setup lang="ts">
const props = defineProps<{ data: any }>()

const fmt = (n: number | null | undefined, fixed = 3) =>
  typeof n === 'number' ? n.toFixed(fixed) : '—'

const fields = computed(() => {
  const d = props.data ?? {}
  const s = d.statistics ?? {}
  return [
    {
      label: 'Cleaner Than',
      value: typeof d.cleanerThan === 'number' ? `${Math.round(d.cleanerThan * 100)}%` : null,
    },
    {
      label: 'Bytes',
      value: typeof d.bytes === 'number' ? d.bytes.toLocaleString() : null,
      mono: true,
    },
    { label: 'Green', value: typeof d.green === 'boolean' ? (d.green ? 'Yes' : 'No') : null },
    {
      label: 'Energy',
      value: typeof s.energy === 'number' ? `${fmt(s.energy)} kWh` : null,
      mono: true,
    },
    {
      label: 'CO₂ (grid)',
      value: typeof s?.co2?.grid?.grams === 'number' ? `${fmt(s.co2.grid.grams)} g` : null,
      mono: true,
    },
    {
      label: 'CO₂ (renewable)',
      value:
        typeof s?.co2?.renewable?.grams === 'number' ? `${fmt(s.co2.renewable.grams)} g` : null,
      mono: true,
    },
  ].filter((f) => f.value)
})
</script>

<template>
  <div v-if="data?.available === false" class="text-caption text-medium-emphasis">
    {{ data?.hint || 'Not available' }}
  </div>
  <div v-else class="cb-grid">
    <div v-for="f in fields" :key="f.label" class="cb-cell">
      <div class="cb-key">{{ f.label }}</div>
      <div class="cb-val" :class="{ 'font-mono': f.mono }">{{ f.value }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cb-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .cb-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .cb-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .cb-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .cb-grid {
    grid-template-columns: 1fr;
  }
}
.cb-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.cb-key {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.cb-val {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.95);
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.78rem;
}
</style>
