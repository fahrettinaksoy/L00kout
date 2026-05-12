<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const truncate = (s: string | null | undefined, n = 60): string => {
  if (!s) return ''
  const str = String(s)
  return str.length > n ? `${str.slice(0, n - 1)}…` : str
}

const items = computed(() => {
  const d = props.data ?? {}
  return [
    {
      key: 'spf',
      label: t('mail.spf'),
      present: !!d.spf,
      value: truncate(d.spf),
    },
    {
      key: 'dkim',
      label: t('mail.dkim'),
      present: !!d.dkim,
      value: d.dkim ? `${t('mail.selector')}: ${d.dkim.selector}` : '',
    },
    {
      key: 'dmarc',
      label: t('mail.dmarc'),
      present: !!d.dmarc,
      value: truncate(d.dmarc),
    },
    {
      key: 'mx',
      label: t('mail.mx'),
      present: Array.isArray(d.mx) && d.mx.length > 0,
      value:
        Array.isArray(d.mx) && d.mx.length
          ? d.mx
              .slice(0, 2)
              .map((m: any) => `${m.priority} ${m.exchange}`)
              .join(', ')
          : '',
    },
  ]
})

const score = computed(() => props.data?.score ?? 0)
const scoreColor = computed(() =>
  score.value >= 3 ? 'success' : score.value >= 1 ? 'warning' : 'error',
)
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3 ga-3">
      <v-avatar :color="scoreColor" size="44" variant="flat">
        <span class="text-h6 font-weight-bold">{{ score }}/3</span>
      </v-avatar>
      <div>
        <div class="text-subtitle-2 font-weight-medium">{{ t('mail.score') }}</div>
        <div class="text-caption text-medium-emphasis">SPF · DKIM · DMARC</div>
      </div>
    </div>

    <div class="mail-grid">
      <div
        v-for="i in items"
        :key="i.key"
        class="mail-cell"
        :class="i.present ? 'mail-cell--ok' : 'mail-cell--missing'"
      >
        <div class="d-flex align-center mb-1">
          <span class="mail-key">{{ i.label }}</span>
          <v-spacer />
          <v-icon
            :icon="i.present ? 'mdi-check-circle' : 'mdi-close-circle'"
            :color="i.present ? 'success' : 'error'"
            size="16"
          />
        </div>
        <div v-if="i.value" class="mail-val font-mono text-truncate" :title="i.value">
          {{ i.value }}
        </div>
        <div v-else class="mail-val text-medium-emphasis">{{ t('mail.missing') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mail-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
  .mail-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .mail-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .mail-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .mail-grid {
    grid-template-columns: 1fr;
  }
}
.mail-cell {
  min-width: 0;
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  &--missing {
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.18);
  }
}
.mail-key {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: rgb(var(--v-theme-primary));
}
.mail-val {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
