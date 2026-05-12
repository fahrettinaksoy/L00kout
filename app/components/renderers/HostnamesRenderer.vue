<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const entries = computed(() => props.data?.ips ?? [])
const hostnames = computed<string[]>(() => props.data?.uniqueHostnames ?? [])
</script>

<template>
  <div>
    <div class="text-caption text-primary font-weight-bold mb-2">{{ t('hostnames.ips') }}</div>
    <div class="ip-grid mb-3">
      <div v-for="e in entries" :key="e.ip" class="ip-cell">
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="font-mono ip-addr">{{ e.ip }}</span>
          <v-chip size="x-small" variant="tonal">{{ e.hosts.length }}</v-chip>
        </div>
        <div v-if="e.hosts.length">
          <div v-for="h in e.hosts" :key="h" class="host-line font-mono text-truncate" :title="h">
            ↳ {{ h }}
          </div>
        </div>
        <div v-else class="text-caption text-medium-emphasis">{{ t('hostnames.noPtr') }}</div>
      </div>
    </div>

    <template v-if="hostnames.length">
      <div class="text-caption text-primary font-weight-bold mb-2">
        {{ t('hostnames.hostnames') }}
      </div>
      <div class="hn-grid">
        <div v-for="h in hostnames" :key="h" class="hn-cell font-mono text-truncate" :title="h">
          {{ h }}
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.ip-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
.hn-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .ip-grid,
  .hn-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .ip-grid,
  .hn-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .ip-grid,
  .hn-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .ip-grid,
  .hn-grid {
    grid-template-columns: 1fr;
  }
}
.ip-cell,
.hn-cell {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.hn-cell {
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
.ip-addr {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
.host-line {
  font-size: 0.74rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
