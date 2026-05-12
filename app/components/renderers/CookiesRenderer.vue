<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const cookies = computed<any[]>(() => props.data?.cookies ?? [])

const stats = computed(() => {
  const list = cookies.value
  const sameSite = list.filter((c) => c.sameSite).length
  const persistent = list.filter((c) => c.expires).length
  return [
    { label: t('cookies.total'), value: props.data?.count ?? list.length, color: 'primary' },
    { label: t('cookies.secure'), value: props.data?.secure ?? 0, color: 'success' },
    { label: t('cookies.httpOnly'), value: props.data?.httpOnly ?? 0, color: 'info' },
    { label: 'SameSite', value: sameSite, color: 'info' },
    { label: 'Persistent', value: persistent, color: 'warning' },
  ]
})
</script>

<template>
  <div>
    <div class="c-stats mb-3">
      <div v-for="s in stats" :key="s.label" class="c-stat">
        <div class="c-num" :class="`text-${s.color}`">{{ s.value }}</div>
        <div class="c-lbl">{{ s.label }}</div>
      </div>
    </div>

    <div v-if="cookies.length" class="c-grid">
      <div v-for="c in cookies" :key="c.name" class="c-cell">
        <div class="c-name text-truncate" :title="c.name">{{ c.name }}</div>
        <div class="c-flags">
          <v-chip v-if="c.secure" size="x-small" color="success" variant="tonal">Secure</v-chip>
          <v-chip v-if="c.httpOnly" size="x-small" color="info" variant="tonal">HttpOnly</v-chip>
          <v-chip v-if="c.sameSite" size="x-small" variant="tonal">{{ c.sameSite }}</v-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.c-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
@media (max-width: 1280px) {
  .c-stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .c-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .c-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .c-stats {
    grid-template-columns: 1fr;
  }
}
.c-stat {
  padding: 10px;
  text-align: center;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.c-num {
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
}
.c-lbl {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
}

.c-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px 12px;
  max-height: 280px;
  overflow-y: auto;
}
@media (max-width: 1280px) {
  .c-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
@media (max-width: 1020px) {
  .c-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .c-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .c-grid {
    grid-template-columns: 1fr;
  }
}
.c-cell {
  min-width: 0;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(127, 127, 127, 0.06);
  border: 1px solid rgba(127, 127, 127, 0.12);
}
.c-name {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.76rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.95);
  margin-bottom: 4px;
}
.c-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}
</style>
