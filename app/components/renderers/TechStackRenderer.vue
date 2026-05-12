<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const detected = computed<{ name: string; category: string }[]>(() => props.data?.detected ?? [])
</script>

<template>
  <div>
    <div class="text-caption text-medium-emphasis mb-2">
      {{ t('techStack.detected', { n: data?.total ?? 0 }) }}
    </div>
    <div class="tech-grid">
      <div v-for="t in detected" :key="t.name" class="tech-cell">
        <div class="tech-cat">{{ t.category }}</div>
        <div class="tech-name text-truncate" :title="t.name">{{ t.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tech-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .tech-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .tech-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .tech-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .tech-grid {
    grid-template-columns: 1fr;
  }
}
.tech-cell {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.tech-cat {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.tech-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.95);
}
</style>
