<script setup lang="ts">
import type { LocationData } from '../../../shared/types/checks'

const props = defineProps<{ data: LocationData }>()
const { t } = useI18n()

const countryFlag = computed(() => {
  const code = props.data?.countryCode?.toUpperCase()
  if (!code || code.length !== 2) return ''
  return String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0)))
})

const mapUrl = computed(() => {
  const lat = props.data?.latitude
  const lng = props.data?.longitude
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const delta = 4
  const bbox = [lng - delta, lat - delta, lng + delta, lat + delta].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
})

const cityLine = computed(() => {
  const d = props.data
  if (!d) return ''
  return [d.postal, d.city, d.region].filter(Boolean).join(', ')
})

const fields = computed(() => {
  const d = props.data ?? {}
  return [
    { label: t('location.city'), value: cityLine.value || null },
    { label: t('location.country'), value: d.country ? `${d.country} ${countryFlag.value}` : null },
    { label: t('location.timezone'), value: d.timezone },
    { label: t('location.languages'), value: (d.languages ?? []).join(', ') || null },
    {
      label: t('location.currency'),
      value: d.currency?.name
        ? d.currency.code
          ? `${d.currency.name} (${d.currency.code})`
          : d.currency.name
        : null,
    },
    { label: t('location.isp'), value: d.org, mono: true },
    { label: t('location.asn'), value: d.asn, mono: true },
    { label: t('location.ip'), value: d.ip, mono: true },
  ].filter((r) => r.value)
})
</script>

<template>
  <div class="loc-row">
    <!-- LEFT: map -->
    <div class="map-wrap">
      <iframe
        v-if="mapUrl"
        :src="mapUrl"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
      <div
        v-else
        class="d-flex align-center justify-center text-medium-emphasis text-caption no-map"
      >
        —
      </div>
    </div>

    <!-- RIGHT: content -->
    <div class="loc-content">
      <div v-if="data?.ipv4?.length || data?.ipv6?.length" class="ip-block">
        <div v-if="data?.ipv4?.length" class="mb-1">
          <span class="ip-label">IPv4</span>
          <v-chip
            v-for="ip in data.ipv4"
            :key="ip"
            size="x-small"
            variant="tonal"
            class="ms-1 font-mono"
            >{{ ip }}</v-chip
          >
        </div>
        <div v-if="data?.ipv6?.length">
          <span class="ip-label">IPv6</span>
          <v-chip
            v-for="ip in data.ipv6"
            :key="ip"
            size="x-small"
            variant="tonal"
            class="ms-1 font-mono"
            >{{ ip }}</v-chip
          >
        </div>
      </div>

      <div class="field-grid">
        <div v-for="f in fields" :key="f.label" class="field-cell">
          <div class="field-label">{{ f.label }}</div>
          <div class="field-value" :class="{ 'font-mono': f.mono }">{{ f.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loc-row {
  display: flex;
  gap: 16px;
  align-items: stretch;
}
.map-wrap {
  position: relative;
  width: 340px;
  flex-shrink: 0;
  min-height: 280px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(127, 127, 127, 0.18);
  background: rgba(127, 127, 127, 0.06);
  iframe {
    width: 100%;
    height: 100%;
    border: 0;
    display: block;
  }
}
.no-map {
  width: 100%;
  height: 100%;
  display: flex;
}
.loc-content {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px 12px;
}
@media (max-width: 1280px) {
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
.ip-block {
  padding: 8px 10px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  border-radius: 8px;
}
.ip-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  letter-spacing: 0.05em;
}

@media (max-width: 760px) {
  .loc-row {
    flex-direction: column;
  }
  .map-wrap {
    width: 100%;
    aspect-ratio: 16/10;
    min-height: 0;
  }
}
</style>
