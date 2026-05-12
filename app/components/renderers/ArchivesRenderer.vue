<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const snapshots = computed<any[]>(() => props.data?.snapshots ?? [])

const fmt = (ts: string) => {
  if (!ts || ts.length < 8) return ts
  return `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}`
}

const buildUrl = (snap: any) => {
  if (!snap?.timestamp || !snap?.original) return null
  return `https://web.archive.org/web/${snap.timestamp}/${snap.original}`
}

const summary = computed(() => {
  const d = props.data ?? {}
  return [
    { label: t('archives.snapshots'), value: d.total ?? 0 },
    { label: t('archives.first'), value: fmt(d.first) },
    { label: t('archives.last'), value: fmt(d.last) },
  ]
})
</script>

<template>
  <div v-if="!data?.found" class="text-caption text-medium-emphasis">
    {{ t('archives.notFound') }}
  </div>
  <div v-else>
    <div class="sum-grid mb-3">
      <div v-for="s in summary" :key="s.label" class="sum-cell">
        <div class="sum-key">{{ s.label }}</div>
        <div class="sum-val">{{ s.value }}</div>
      </div>
    </div>

    <div class="text-caption text-medium-emphasis mb-1">Snapshots</div>
    <div class="ar-grid">
      <a
        v-for="(s, i) in snapshots"
        :key="i"
        :href="buildUrl(s) ?? '#'"
        target="_blank"
        rel="noopener"
        class="ar-cell text-truncate"
        :title="s.original"
      >
        <div class="ar-date font-mono">{{ fmt(s.timestamp) }}</div>
        <div class="ar-loc font-mono text-truncate">{{ s.original }}</div>
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sum-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 12px;
}
.sum-cell {
  padding: 8px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.sum-key {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.sum-val {
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.95);
}

.ar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 280px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .ar-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .ar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .ar-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .ar-grid {
    grid-template-columns: 1fr;
  }
}
.ar-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  text-decoration: none;
  display: block;
  &:hover {
    background: rgba(127, 127, 127, 0.12);
    border-color: rgb(var(--v-theme-primary));
  }
}
.ar-date {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 2px;
}
.ar-loc {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
