<script setup lang="ts">
import type { SslData } from '../../../shared/types/checks'

const props = defineProps<{ data: SslData }>()
const { t, locale } = useI18n()

const cert = computed(() => props.data ?? {})

const expiryColor = computed(() => {
  const d = cert.value.daysRemaining ?? 0
  if (d < 14) return 'error'
  if (d < 30) return 'warning'
  return 'success'
})

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

const truncate = (s: string | null | undefined, n = 22) => {
  if (!s) return '—'
  const str = String(s)
  return str.length > n ? `${str.slice(0, n - 1)}…` : str
}

const gradeColor = (g: string | null | undefined): string => {
  if (!g) return 'grey'
  if (g.startsWith('A')) return 'success'
  if (g.startsWith('B')) return 'info'
  if (g.startsWith('C')) return 'warning'
  return 'error'
}

const ephemeralLabel = computed(() => {
  const e = cert.value.ephemeralKey
  if (!e) return null
  return [e.type, e.name, e.size ? `${e.size}-bit` : null].filter(Boolean).join(' ')
})

const fields = computed(() => {
  const c = cert.value
  return [
    { label: t('ssl.subject'), value: c.subject?.CN, mono: true },
    { label: t('ssl.issuer'), value: c.issuer?.O || c.issuer?.CN },
    { label: t('ssl.trusted'), bool: c.trusted },
    { label: t('ssl.asn1Curve'), value: c.asn1Curve, mono: true },
    { label: t('ssl.nistCurve'), value: c.nistCurve, mono: true },
    { label: t('ssl.expires'), value: fmtDate(c.validTo) },
    { label: t('ssl.renewed'), value: fmtDate(c.validFrom) },
    { label: t('ssl.serialNumber'), value: truncate(c.serialNumber), mono: true },
    { label: t('ssl.fingerprint'), value: truncate(c.fingerprint256), mono: true },
    { label: t('ssl.signature'), value: c.signatureAlgorithm, mono: true },
    { label: t('ssl.protocol'), value: c.protocol, mono: true },
    { label: t('ssl.cipher'), value: truncate(c.cipher, 28), mono: true },
    { label: t('ssl.alpn'), value: c.alpnProtocol, mono: true },
    { label: t('ssl.ephemeralKey'), value: ephemeralLabel.value, mono: true },
    { label: t('ssl.forwardSecrecy'), bool: c.forwardSecrecy },
    { label: t('ssl.sessionResumption'), bool: c.sessionResumption },
    { label: t('ssl.ocsp'), bool: c.ocspStapling },
  ].filter((r) => r.bool !== undefined || (r.value && r.value !== '—'))
})
</script>

<template>
  <div>
    <div class="d-flex align-center flex-wrap ga-2 mb-3">
      <v-chip :color="expiryColor" size="small" variant="flat">
        <v-icon icon="mdi-clock-check" start size="14" />
        {{ t('ssl.daysLeft', { n: cert.daysRemaining }) }}
      </v-chip>
      <v-chip
        v-if="cert.labs?.grade"
        :color="gradeColor(cert.labs.grade)"
        size="small"
        variant="flat"
      >
        <v-icon icon="mdi-certificate" start size="14" />
        {{ t('ssl.labsGrade') }}: {{ cert.labs.grade }}
      </v-chip>
    </div>

    <div class="field-grid">
      <div v-for="f in fields" :key="f.label" class="field-cell">
        <div class="field-label">{{ f.label }}</div>
        <div class="field-value" :class="{ 'font-mono': f.mono }">
          <template v-if="f.bool !== undefined">
            <v-chip size="x-small" :color="f.bool ? 'success' : 'error'" variant="flat">
              <v-icon :icon="f.bool ? 'mdi-check' : 'mdi-close'" start size="12" />
              {{ f.bool ? t('ssl.yes') : t('ssl.no') }}
            </v-chip>
          </template>
          <template v-else>{{ f.value }}</template>
        </div>
      </div>
    </div>

    <template v-if="cert.extKeyUsage?.length">
      <div class="text-caption text-primary font-weight-bold mt-3 mb-1">
        {{ t('ssl.extKeyUsage') }}
      </div>
      <div class="text-body-2">
        <div v-for="usage in cert.extKeyUsage" :key="usage" class="font-mono ext-line">
          {{ usage }}
        </div>
      </div>
    </template>
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
.ext-line {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
}
</style>
