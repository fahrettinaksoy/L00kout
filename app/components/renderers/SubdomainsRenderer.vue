<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const subs = computed<string[]>(() => props.data?.subdomains ?? [])
</script>

<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-2">
      <div>
        <div class="text-caption text-medium-emphasis">{{ t('subdomains.base') }}</div>
        <div class="text-body-2 font-mono">{{ data?.base }}</div>
      </div>
      <div class="text-right">
        <div class="text-caption text-medium-emphasis">{{ t('subdomains.found') }}</div>
        <div class="text-h6 font-weight-bold">{{ data?.total ?? 0 }}</div>
      </div>
    </div>

    <div v-if="!subs.length" class="text-caption text-medium-emphasis mt-2">
      {{ t('subdomains.noneFound') }}
    </div>

    <div v-else>
      <div class="sub-grid">
        <div v-for="s in subs" :key="s" class="sub-item text-truncate" :title="s">{{ s }}</div>
      </div>
      <div v-if="data?.truncated" class="text-caption text-medium-emphasis mt-2">
        {{ t('subdomains.showing', { n: subs.length }) }} / {{ data.total }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sub-grid {
  margin-top: 8px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 4px 12px;
  max-height: 360px;
  overflow-y: auto;
  padding-top: 4px;
  border-top: 1px solid rgba(127, 127, 127, 0.12);
}
.sub-item {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.78rem;
  padding: 4px 6px;
  border-radius: 4px;
  color: rgba(var(--v-theme-on-surface), 0.9);
  min-width: 0;
  &:hover {
    background: rgba(127, 127, 127, 0.1);
  }
}
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
