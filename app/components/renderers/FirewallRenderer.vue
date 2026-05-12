<script setup lang="ts">
defineProps<{ data: any }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3">
      <span class="text-subtitle-2 font-weight-bold">Firewall</span>
      <v-spacer />
      <v-chip size="small" :color="data?.hasWaf ? 'success' : 'error'" variant="flat">
        <v-icon :icon="data?.hasWaf ? 'mdi-check' : 'mdi-close'" start size="14" />
        {{ data?.hasWaf ? t('firewall.detected') : t('firewall.notDetected') }}
      </v-chip>
    </div>

    <div v-if="data?.detected?.length" class="fw-grid mb-2">
      <div v-for="n in data.detected" :key="n" class="fw-cell">
        <v-icon icon="mdi-wall-fire" size="16" color="primary" />
        <span class="text-body-2 text-truncate">{{ n }}</span>
      </div>
    </div>

    <div v-if="data?.server" class="text-caption text-medium-emphasis">
      {{ t('firewall.server') }}: <span class="font-mono">{{ data.server }}</span>
    </div>

    <div v-if="!data?.hasWaf" class="disclaimer mt-2">*{{ t('firewall.disclaimer') }}</div>
  </div>
</template>

<style scoped lang="scss">
.fw-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .fw-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .fw-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .fw-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .fw-grid {
    grid-template-columns: 1fr;
  }
}
.fw-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  min-width: 0;
}
.disclaimer {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  line-height: 1.5;
  font-style: italic;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.82rem;
}
</style>
