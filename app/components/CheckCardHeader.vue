<script setup lang="ts">
import type { CheckMeta, CheckStatus } from '~/types/check'
import { statusColor, statusIcon } from '~/composables/useCheckStatus'

defineProps<{
  meta: CheckMeta
  status: CheckStatus | undefined
  isRunning: boolean
}>()

const emit = defineEmits<{
  info: []
  refresh: []
}>()

const { t } = useI18n()
const { categoryMeta } = useCheckRegistry()

// statusColor / statusIcon are auto-imported from app/composables/useCheckStatus.ts
</script>

<template>
  <div class="card-header">
    <div class="d-flex align-start ga-3">
      <v-avatar :color="categoryMeta[meta.category].color" variant="tonal" size="40">
        <v-icon :icon="meta.icon" />
      </v-avatar>
      <div class="flex-grow-1 min-width-0">
        <div class="text-subtitle-1 font-weight-medium">
          {{ t(`checks.${meta.id}.title`) }}
        </div>
        <div class="text-caption text-medium-emphasis mt-1">
          {{ t(`checks.${meta.id}.description`) }}
        </div>
      </div>
    </div>

    <div class="d-flex align-center ga-1 mt-auto pt-3">
      <v-icon
        :icon="statusIcon(status)"
        :color="statusColor(status)"
        size="20"
        :aria-label="status ?? 'idle'"
      />
      <v-spacer />
      <v-btn
        icon="mdi-information-outline"
        variant="text"
        size="small"
        density="comfortable"
        :title="t('common.info')"
        :aria-label="t('common.info')"
        @click="emit('info')"
      />
      <v-btn
        icon="mdi-refresh"
        variant="text"
        size="small"
        density="comfortable"
        :loading="isRunning"
        :disabled="isRunning"
        :title="t('common.refresh')"
        :aria-label="t('common.refresh')"
        @click="emit('refresh')"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.card-header {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.min-width-0 {
  min-width: 0;
}
@media (max-width: 720px) {
  .card-header {
    width: 100%;
    border-bottom: 1px solid rgba(127, 127, 127, 0.18);
  }
}
</style>
