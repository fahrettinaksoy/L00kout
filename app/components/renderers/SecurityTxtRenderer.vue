<script setup lang="ts">
const props = defineProps<{ data: any }>()

const fields = computed(() => {
  const f = props.data?.fields ?? {}
  const out: { label: string; value: string; mono?: boolean }[] = []
  for (const [key, vals] of Object.entries(f)) {
    const arr = Array.isArray(vals) ? vals : []
    for (const v of arr) {
      out.push({ label: key, value: String(v), mono: true })
    }
  }
  return out
})
</script>

<template>
  <div v-if="!data?.found" class="text-caption text-medium-emphasis">Not found</div>
  <div v-else>
    <div class="text-caption text-medium-emphasis mb-2 text-truncate">{{ data?.source }}</div>
    <div class="st-grid">
      <div v-for="(f, i) in fields" :key="i" class="st-cell">
        <div class="st-key">{{ f.label }}</div>
        <div class="st-val font-mono text-truncate" :title="f.value">{{ f.value }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.st-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .st-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .st-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .st-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .st-grid {
    grid-template-columns: 1fr;
  }
}
.st-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.st-key {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.st-val {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
