<script setup lang="ts">
import type { CheckResult } from '~/types/check'

defineProps<{
  checkId: string
  result: CheckResult | undefined
}>()

const { t } = useI18n()
const { format: formatError } = useCheckError()
</script>

<template>
  <div class="card-body" role="status" :aria-busy="result?.status === 'loading'">
    <template v-if="!result || result.status === 'idle'">
      <v-skeleton-loader type="text@2" />
    </template>
    <template v-else-if="result.status === 'loading'">
      <v-progress-linear
        indeterminate
        color="primary"
        class="mb-3"
        :aria-label="t('common.loading')"
      />
      <div class="text-caption text-medium-emphasis">
        {{ t('common.loading') }}
      </div>
    </template>
    <template v-else-if="result.status === 'error'">
      <v-alert type="error" variant="tonal" density="compact" :text="formatError(result.error)" />
    </template>
    <template v-else>
      <CheckResultRenderer :id="checkId" :data="result.data" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.card-body {
  flex: 1 1 auto;
  overflow: hidden;
  padding: 16px;
}
</style>
