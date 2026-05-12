<script setup lang="ts">
import type { CheckResult } from '~/types/check'
import { formatDuration } from '~/composables/useCheckStatus'

const props = defineProps<{ result: CheckResult | undefined }>()

const emit = defineEmits<{
  'toggle-raw': [next: boolean]
}>()

const { t } = useI18n()
const expanded = ref(false)

const duration = computed(() => {
  const seconds = formatDuration(props.result)
  if (seconds === null) return null
  return seconds.toFixed(2) + t('common.secondsShort')
})

const toggle = () => {
  expanded.value = !expanded.value
  emit('toggle-raw', expanded.value)
}
</script>

<template>
  <div v-if="result?.status === 'success'" class="card-footer">
    <span class="text-caption text-medium-emphasis">
      <v-icon icon="mdi-clock-outline" size="14" class="me-1" />{{ duration }}
    </span>
    <v-spacer />
    <v-btn
      size="small"
      variant="text"
      :append-icon="expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
      :aria-expanded="expanded"
      @click="toggle"
    >
      {{ t('common.rawData') }}
    </v-btn>
  </div>
</template>

<style scoped lang="scss">
.card-footer {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid rgba(127, 127, 127, 0.18);
}
</style>
