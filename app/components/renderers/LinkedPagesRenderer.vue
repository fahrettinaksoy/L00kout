<script setup lang="ts">
const props = defineProps<{ data: any }>()

const tab = ref<'internal' | 'external'>('internal')

const list = computed<string[]>(() => {
  const d = props.data ?? {}
  return tab.value === 'internal' ? (d.internal ?? []) : (d.external ?? [])
})

const internalCount = computed(() => props.data?.internalCount ?? 0)
const externalCount = computed(() => props.data?.externalCount ?? 0)

const short = (url: string) => {
  try {
    const u = new URL(url)
    return u.pathname + u.search
  } catch {
    return url
  }
}
</script>

<template>
  <div>
    <div class="d-flex ga-2 mb-3">
      <v-chip
        size="small"
        :color="tab === 'internal' ? 'primary' : undefined"
        :variant="tab === 'internal' ? 'flat' : 'tonal'"
        @click="tab = 'internal'"
      >
        <v-icon icon="mdi-home-circle" start size="14" />
        Internal · {{ internalCount }}
      </v-chip>
      <v-chip
        size="small"
        :color="tab === 'external' ? 'primary' : undefined"
        :variant="tab === 'external' ? 'flat' : 'tonal'"
        @click="tab = 'external'"
      >
        <v-icon icon="mdi-earth" start size="14" />
        External · {{ externalCount }}
      </v-chip>
    </div>

    <div class="lp-grid">
      <a
        v-for="u in list"
        :key="u"
        :href="u"
        target="_blank"
        rel="noopener"
        class="lp-cell text-truncate"
        :title="u"
      >
        {{ tab === 'internal' ? short(u) : u }}
      </a>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lp-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 320px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .lp-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .lp-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .lp-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .lp-grid {
    grid-template-columns: 1fr;
  }
}
.lp-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.76rem;
  color: rgba(var(--v-theme-on-surface), 0.9);
  text-decoration: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &:hover {
    background: rgba(127, 127, 127, 0.1);
    color: rgb(var(--v-theme-primary));
  }
}
</style>
