<script setup lang="ts">
const props = defineProps<{ data: any }>()

const hops = computed<{ hop: number; raw: string }[]>(() => props.data?.hops ?? [])
</script>

<template>
  <div v-if="!data?.available" class="text-caption text-medium-emphasis">
    {{ data?.error || 'Not available' }}
  </div>
  <div v-else>
    <div class="text-caption text-medium-emphasis mb-2">{{ hops.length }} hops</div>
    <div class="tr-grid">
      <div v-for="h in hops" :key="h.hop" class="tr-cell">
        <div class="tr-hop">#{{ h.hop }}</div>
        <div class="tr-val font-mono text-truncate" :title="h.raw">{{ h.raw }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tr-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 320px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .tr-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .tr-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .tr-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .tr-grid {
    grid-template-columns: 1fr;
  }
}
.tr-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.tr-hop {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 2px;
}
.tr-val {
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
