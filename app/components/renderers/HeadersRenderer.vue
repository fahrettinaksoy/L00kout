<script setup lang="ts">
const props = defineProps<{ data: any }>()

const entries = computed(() =>
  Object.entries(props.data?.headers ?? {}).map(([k, v]) => ({ k, v: String(v ?? '') })),
)
</script>

<template>
  <div>
    <v-chip
      size="small"
      :color="(data?.status ?? 0) < 400 ? 'success' : 'error'"
      variant="flat"
      class="mb-3"
    >
      {{ data?.status }}
    </v-chip>

    <div class="hdr-grid">
      <div v-for="e in entries" :key="e.k" class="hdr-cell">
        <div class="hdr-key">{{ e.k }}</div>
        <div class="hdr-val font-mono text-truncate" :title="e.v">{{ e.v }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hdr-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .hdr-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .hdr-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .hdr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .hdr-grid {
    grid-template-columns: 1fr;
  }
}
.hdr-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.hdr-key {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.hdr-val {
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
