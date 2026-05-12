<script setup lang="ts">
import type { WhoisData } from '../../../shared/types/checks'

const props = defineProps<{ data: WhoisData }>()
const { t, locale } = useI18n()

const fmtDate = (s: string | null) => {
  if (!s) return '—'
  const d = new Date(s)
  if (isNaN(d.getTime())) return s
  return d.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const truncate = (s: string | null | undefined, n = 28): string => {
  if (!s) return '—'
  return s.length > n ? `…${s.slice(-(n - 1))}` : s
}

const fields = computed(() => {
  const d = props.data ?? {}
  return [
    { label: t('whois.domain'), value: d.domain, mono: true },
    { label: t('whois.registrar'), value: d.registrar, highlight: true },
    { label: t('whois.created'), value: fmtDate(d.created) },
    { label: t('whois.updated'), value: fmtDate(d.updated) },
    { label: t('whois.expires'), value: fmtDate(d.expires) },
    { label: t('whois.registrarIanaId'), value: d.registrarIanaId, mono: true },
    { label: t('whois.dnssec'), value: d.dnssec },
    { label: t('whois.registryId'), value: truncate(d.registryId), mono: true },
    { label: t('whois.registrarWhois'), value: truncate(d.registrarWhois), mono: true },
  ].filter((r) => r.value && r.value !== '—')
})
</script>

<template>
  <div class="field-grid">
    <div v-for="f in fields" :key="f.label" class="field-cell">
      <div class="field-label">{{ f.label }}</div>
      <div
        class="field-value"
        :class="{
          'font-mono': f.mono,
          'text-primary font-weight-medium': f.highlight,
        }"
      >
        {{ f.value }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.field-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px 16px;
}
@media (max-width: 1280px) {
  .field-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .field-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .field-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
.field-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.field-label {
  font-size: 0.68rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.55);
  margin-bottom: 2px;
}
.field-value {
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
</style>
