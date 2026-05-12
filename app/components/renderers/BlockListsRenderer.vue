<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const results = computed(() => props.data?.results ?? [])
const safe = computed(() => props.data?.safeCount ?? 0)
const total = computed(() => props.data?.totalCount ?? results.value.length)
</script>

<template>
  <div>
    <div class="text-caption text-medium-emphasis mb-2">
      {{ t('blockLists.summary', { safe, total }) }}
    </div>
    <div class="bl-grid">
      <div
        v-for="r in results"
        :key="r.name"
        class="bl-cell"
        :class="r.blocked ? 'bl-cell--blocked' : 'bl-cell--ok'"
      >
        <v-icon
          :icon="r.blocked ? 'mdi-close-circle' : 'mdi-check-circle'"
          :color="r.blocked ? 'error' : 'success'"
          size="16"
        />
        <span class="text-body-2 text-truncate">{{ r.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bl-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .bl-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .bl-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .bl-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .bl-grid {
    grid-template-columns: 1fr;
  }
}
.bl-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  min-width: 0;
  &--blocked {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.25);
  }
}
</style>
