<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const fields = computed(() => {
  const d = props.data ?? {}
  if (!d.available) return []
  return [
    { label: 'IP', value: d.ip, mono: true },
    { label: 'Org', value: d.org },
    { label: 'ISP', value: d.isp },
    { label: 'OS', value: d.os },
    { label: 'Ports', value: Array.isArray(d.ports) ? d.ports.join(', ') : null, mono: true },
    {
      label: 'Hostnames',
      value: Array.isArray(d.hostnames) ? d.hostnames.slice(0, 3).join(', ') : null,
    },
    { label: 'Tags', value: Array.isArray(d.tags) ? d.tags.join(', ') : null },
    { label: 'Vulns', value: Array.isArray(d.vulns) ? d.vulns.length + ' CVE' : null, mono: true },
  ].filter((f) => f.value)
})
</script>

<template>
  <div>
    <div v-if="!data?.available" class="not-avail">
      <v-icon icon="mdi-key-alert" size="20" color="warning" class="me-2" />
      <div>
        <div class="text-body-2 font-weight-medium">{{ t('external.keyRequired') }}</div>
        <div class="text-caption text-medium-emphasis">{{ t('external.keyHint') }}</div>
      </div>
    </div>
    <div v-else class="sh-grid">
      <div v-for="f in fields" :key="f.label" class="sh-cell">
        <div class="sh-key">{{ f.label }}</div>
        <div class="sh-val text-truncate" :class="{ 'font-mono': f.mono }" :title="String(f.value)">
          {{ f.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sh-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .sh-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .sh-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .sh-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .sh-grid {
    grid-template-columns: 1fr;
  }
}
.sh-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.sh-key {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.sh-val {
  font-size: 0.85rem;
  color: rgba(var(--v-theme-on-surface), 0.95);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.78rem;
}
.not-avail {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.22);
}
</style>
