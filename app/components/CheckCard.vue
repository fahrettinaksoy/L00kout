<script setup lang="ts">
import type { CheckMeta } from '~/types/check'

const props = defineProps<{ meta: CheckMeta }>()

const store = useResultsStore()
const { runSingle } = useCheckRunner()
const { open: openInfo } = useInfoDrawer()

const result = computed(() => store.results[props.meta.id])
const isRunning = computed(() => result.value?.status === 'loading')
const rawExpanded = ref(false)
</script>

<template>
  <v-card
    class="check-card pa-0"
    :class="{ 'check-card--loading': isRunning }"
    role="region"
    :aria-label="meta.id"
  >
    <div class="card-row">
      <CheckCardHeader
        :meta="meta"
        :status="result?.status"
        :is-running="isRunning"
        @info="openInfo(meta.id)"
        @refresh="runSingle(meta.id)"
      />
      <v-divider vertical />
      <div class="card-right">
        <CheckCardBody :check-id="meta.id" :result="result" />
        <CheckCardFooter :result="result" @toggle-raw="rawExpanded = $event" />
      </div>
    </div>

    <v-expand-transition>
      <div v-show="rawExpanded && result?.status === 'success'" class="raw-data">
        <v-divider />
        <pre class="pa-4 ma-0 text-caption">{{ JSON.stringify(result?.data, null, 2) }}</pre>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<style scoped lang="scss">
.check-card {
  transition: all 0.2s ease;
  overflow: hidden;
  &:hover {
    transform: translateY(-2px);
  }
  &--loading {
    border-color: rgba(91, 141, 239, 0.3);
  }
}
.card-row {
  display: flex;
  align-items: stretch;
  min-height: 180px;
}
.card-right {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.raw-data pre {
  max-height: 300px;
  overflow: auto;
  background: rgba(0, 0, 0, 0.2);
  font-family: 'SF Mono', 'Menlo', monospace;
}
@media (max-width: 720px) {
  .card-row {
    flex-direction: column;
    min-height: 0;
  }
}
</style>
