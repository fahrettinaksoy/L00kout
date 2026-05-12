<script setup lang="ts">
const props = defineProps<{ data: any }>()

const items = computed(() => {
  const d = props.data ?? {}
  const urlhaus = d.urlhaus
  const phish = d.phishReport
  return [
    {
      label: 'URLhaus',
      ok: urlhaus?.listed !== true && urlhaus?.query_status !== 'ok',
      value: urlhaus?.query_status === 'ok' ? 'Listed' : 'Clean',
    },
    {
      label: 'PhishReport',
      ok: !phish || !phish?.urlscan?.malicious,
      value: phish?.urlscan?.malicious ? 'Malicious' : 'Clean',
    },
  ]
})
</script>

<template>
  <div class="th-grid">
    <div
      v-for="i in items"
      :key="i.label"
      class="th-cell"
      :class="i.ok ? 'th-cell--ok' : 'th-cell--bad'"
    >
      <div class="d-flex align-center mb-1">
        <span class="th-key">{{ i.label }}</span>
        <v-spacer />
        <v-icon
          :icon="i.ok ? 'mdi-check-circle' : 'mdi-alert-circle'"
          :color="i.ok ? 'success' : 'error'"
          size="16"
        />
      </div>
      <div class="th-val">{{ i.value }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.th-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .th-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .th-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .th-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .th-grid {
    grid-template-columns: 1fr;
  }
}
.th-cell {
  min-width: 0;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  &--bad {
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.2);
  }
}
.th-key {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}
.th-val {
  font-size: 0.82rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
</style>
