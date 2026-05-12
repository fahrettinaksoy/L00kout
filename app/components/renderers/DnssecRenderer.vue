<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const TYPES = ['DNSKEY', 'DS', 'RRSIG'] as const
const FLAG_LABELS = [
  { key: 'rd', label: 'Recursion Desired (RD)' },
  { key: 'ra', label: 'Recursion Available (RA)' },
  { key: 'tc', label: 'TrunCation (TC)' },
  { key: 'ad', label: 'Authentic Data (AD)' },
  { key: 'cd', label: 'Checking Disabled (CD)' },
] as const

const sections = computed(() => props.data?.sections ?? {})
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3">
      <v-chip size="small" :color="data?.enabled ? 'success' : 'error'" variant="flat">
        <v-icon :icon="data?.enabled ? 'mdi-check' : 'mdi-close'" start size="14" />
        DNSSEC {{ data?.enabled ? t('dnssecExt.active') : t('dnssecExt.inactive') }}
      </v-chip>
    </div>

    <div v-for="type in TYPES" :key="type" class="type-section">
      <div class="type-head-row">
        <span class="type-head">{{ type }}</span>
        <v-icon
          :icon="sections[type]?.present ? 'mdi-check-circle' : 'mdi-close-circle'"
          :color="sections[type]?.present ? 'success' : 'error'"
          size="18"
        />
      </div>
      <div class="flag-grid">
        <div
          v-for="f in FLAG_LABELS"
          :key="f.key"
          class="flag-cell"
          :class="sections[type]?.flags?.[f.key] ? 'flag-cell--on' : 'flag-cell--off'"
        >
          <div class="flag-label">{{ f.label }}</div>
          <v-icon
            :icon="sections[type]?.flags?.[f.key] ? 'mdi-check' : 'mdi-close'"
            :color="sections[type]?.flags?.[f.key] ? 'success' : 'error'"
            size="14"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.type-section {
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
}
.type-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 0 4px;
}
.type-head {
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-primary));
}
.flag-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 10px;
}
@media (max-width: 1280px) {
  .flag-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .flag-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .flag-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .flag-grid {
    grid-template-columns: 1fr;
  }
}
.flag-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  min-width: 0;
}
.flag-label {
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
