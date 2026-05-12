<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const openPorts = computed<{ port: number; service: string }[]>(() => props.data?.open ?? [])
const closedPorts = computed<number[]>(() =>
  (props.data?.results ?? [])
    .filter((p: any) => !p.open)
    .map((p: any) => p.port)
    .sort((a: number, b: number) => a - b),
)
</script>

<template>
  <div>
    <div class="text-caption text-medium-emphasis mb-2">
      {{ t('ports.openCount', { n: openPorts.length }) }}
    </div>

    <div v-if="openPorts.length" class="p-grid mb-3">
      <div v-for="p in openPorts" :key="p.port" class="p-cell p-cell--open">
        <div class="p-port">{{ p.port }}</div>
        <div class="p-svc">{{ p.service }}</div>
      </div>
    </div>
    <div v-else class="text-caption text-medium-emphasis mb-3">
      {{ t('ports.allClosed') }}
    </div>

    <div v-if="closedPorts.length">
      <div class="text-caption text-medium-emphasis mb-1">{{ t('ports.closedTitle') }}:</div>
      <div class="closed-ports font-mono">{{ closedPorts.join(', ') }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.p-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .p-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .p-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .p-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .p-grid {
    grid-template-columns: 1fr;
  }
}
.p-cell {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.22);
}
.p-port {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-success));
}
.p-svc {
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.65);
}
.closed-ports {
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.55);
  line-height: 1.6;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
