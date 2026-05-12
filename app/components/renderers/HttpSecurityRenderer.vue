<script setup lang="ts">
import type { HttpSecurityData } from '../../../shared/types/checks'

const props = defineProps<{ data: HttpSecurityData }>()
const { t } = useI18n()

const gradeColor = computed(() => {
  const g = props.data?.grade
  return g === 'A' ? 'success' : g === 'B' ? 'info' : g === 'C' ? 'warning' : 'error'
})

const hsts = computed(() => props.data?.hsts ?? { enabled: false })

const hstsYears = computed(() => {
  const s = hsts.value.maxAgeSeconds
  if (!s) return null
  return (s / 31536000).toFixed(1)
})

const PRETTY: Record<string, string> = {
  'strict-transport-security': 'Strict-Transport-Security',
  'content-security-policy': 'Content-Security-Policy',
  'x-frame-options': 'X-Frame-Options',
  'x-content-type-options': 'X-Content-Type-Options',
  'referrer-policy': 'Referrer-Policy',
  'permissions-policy': 'Permissions-Policy',
  'cross-origin-opener-policy': 'Cross-Origin-Opener-Policy',
  'cross-origin-resource-policy': 'Cross-Origin-Resource-Policy',
  'cross-origin-embedder-policy': 'Cross-Origin-Embedder-Policy',
}

const headerRows = computed(() => {
  const ck = props.data?.checks ?? {}
  return Object.entries(ck).map(([k, v]: [string, any]) => ({
    key: k,
    label: PRETTY[k] ?? k,
    present: !!v?.present,
  }))
})
</script>

<template>
  <div>
    <div class="d-flex align-center ga-4 mb-3">
      <v-avatar :color="gradeColor" size="56" variant="flat">
        <span class="text-h4 font-weight-bold">{{ data?.grade }}</span>
      </v-avatar>
      <div>
        <div class="text-h5 font-weight-bold">{{ data?.score }}/100</div>
        <div class="text-caption text-medium-emphasis">
          {{ t('httpSec.headersPresent', { n: data?.present, total: data?.total }) }}
        </div>
      </div>
    </div>

    <!-- HSTS block -->
    <div class="hsts-block mb-3">
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-shield-check" size="16" class="me-1" />
        <span class="text-caption font-weight-bold">{{ t('httpSec.hstsTitle') }}</span>
        <v-spacer />
        <v-chip size="x-small" :color="hsts.enabled ? 'success' : 'error'" variant="flat">
          {{ hsts.enabled ? t('httpSec.hstsActive') : t('httpSec.hstsMissing') }}
        </v-chip>
      </div>
      <div v-if="hsts.enabled" class="d-flex flex-wrap ga-1">
        <v-chip v-if="hstsYears" size="x-small" variant="tonal">
          {{ t('httpSec.hstsMaxAge') }}: {{ hstsYears }}y
        </v-chip>
        <v-chip v-if="hsts.includesSubdomains" size="x-small" color="info" variant="tonal">
          + {{ t('httpSec.hstsSubdomains') }}
        </v-chip>
        <v-chip v-if="hsts.preload" size="x-small" color="success" variant="tonal">
          + {{ t('httpSec.hstsPreload') }}
        </v-chip>
      </div>
    </div>

    <!-- Individual headers -->
    <div class="text-caption text-primary font-weight-bold mb-2">
      {{ t('httpSec.headers') }}
    </div>
    <div class="hs-grid">
      <div
        v-for="h in headerRows"
        :key="h.key"
        class="hs-cell"
        :class="h.present ? 'hs-cell--ok' : 'hs-cell--missing'"
      >
        <v-icon
          :icon="h.present ? 'mdi-check-circle' : 'mdi-close-circle'"
          :color="h.present ? 'success' : 'error'"
          size="16"
        />
        <span class="text-body-2 font-mono text-truncate" :title="h.label">{{ h.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hsts-block {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(127, 127, 127, 0.08);
  border: 1px solid rgba(127, 127, 127, 0.16);
}
.hs-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
}
@media (max-width: 1280px) {
  .hs-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .hs-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .hs-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .hs-grid {
    grid-template-columns: 1fr;
  }
}
.hs-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  min-width: 0;
  &--missing {
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.18);
  }
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.78rem;
}
</style>
