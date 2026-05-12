<script setup lang="ts">
import type { DnsData } from '../../../shared/types/checks'

const props = defineProps<{ data: DnsData }>()
const { t } = useI18n()

const TYPE_ORDER = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'SOA', 'TXT', 'SRV'] as const

interface Group {
  type: string
  values: string[]
}

const records = computed(() => props.data?.records ?? {})
const txtClassified = computed<Record<string, string[]>>(() => props.data?.txt?.classified ?? {})
const nameServers = computed<string[]>(() => props.data?.nameServers ?? [])
const dohSupport = computed<Record<string, boolean>>(() => props.data?.dohSupport ?? {})

const formatRecord = (type: string, rec: any): string => {
  if (type === 'MX') return `${rec.priority ?? ''} ${rec.exchange ?? ''}`.trim()
  if (type === 'SOA') return rec.nsname ? `${rec.nsname} (${rec.hostmaster})` : String(rec)
  if (type === 'SRV') return `${rec.priority} ${rec.weight} ${rec.port} ${rec.name}`
  if (type === 'TXT') return Array.isArray(rec) ? rec.join('') : String(rec)
  return String(rec)
}

const groups = computed<Group[]>(() => {
  const out: Group[] = []
  for (const type of TYPE_ORDER) {
    const v = records.value[type]
    const arr = Array.isArray(v) ? v : v && typeof v === 'object' ? [v] : []
    if (!arr.length) continue
    out.push({ type, values: arr.map((item: any) => formatRecord(type, item)) })
  }
  return out
})

const TXT_LABELS: Record<string, string> = {
  spf: 'SPF',
  dmarc: 'DMARC',
  dkim: 'DKIM',
  bimi: 'BIMI',
  verification: 'Verify',
}

const txtTypes = computed(() =>
  Object.entries(txtClassified.value)
    .filter(([k]) => k !== 'other')
    .map(([k, v]) => ({ key: k, label: TXT_LABELS[k] ?? k.toUpperCase(), count: v.length })),
)
</script>

<template>
  <div>
    <div v-if="!groups.length" class="text-caption text-medium-emphasis">
      {{ t('dns.noRecords') }}
    </div>

    <div v-for="g in groups" :key="g.type" class="dns-section">
      <div class="dns-type">
        {{ g.type }} <span class="dns-count">· {{ g.values.length }}</span>
      </div>
      <div class="dns-grid">
        <div v-for="(v, i) in g.values" :key="i" class="dns-cell text-truncate" :title="v">
          {{ v }}
        </div>
      </div>
    </div>

    <!-- DoH support -->
    <template v-if="nameServers.length">
      <div class="dns-type mt-3">
        <v-icon icon="mdi-shield-key" size="14" class="me-1" />
        {{ t('dns.doh') }}
      </div>
      <div class="dns-grid">
        <v-chip
          v-for="ns in nameServers.slice(0, 5)"
          :key="ns"
          size="x-small"
          :color="dohSupport[ns] ? 'success' : 'grey'"
          variant="tonal"
        >
          <v-icon :icon="dohSupport[ns] ? 'mdi-check' : 'mdi-minus'" start size="12" />
          {{ ns.replace(/\.$/, '') }}
        </v-chip>
      </div>
    </template>

    <!-- TXT classification -->
    <template v-if="txtTypes.length">
      <div class="dns-type mt-3">
        <v-icon icon="mdi-text-box" size="14" class="me-1" />
        {{ t('dns.txtClassified') }}
      </div>
      <div class="dns-grid">
        <v-chip v-for="tt in txtTypes" :key="tt.key" size="x-small" color="primary" variant="tonal">
          {{ tt.label }} · {{ tt.count }}
        </v-chip>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.dns-section {
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
}
.dns-type {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
  text-transform: uppercase;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.dns-count {
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-weight: 500;
  margin-left: 4px;
}
.dns-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .dns-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .dns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .dns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .dns-grid {
    grid-template-columns: 1fr;
  }
}
.dns-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.92);
}
</style>
