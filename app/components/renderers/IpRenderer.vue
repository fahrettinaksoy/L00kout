<script setup lang="ts">
defineProps<{ data: any }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <div v-if="data?.ipv4?.length" class="mb-2">
      <div class="text-caption text-medium-emphasis mb-1">{{ t('ip.ipv4') }}</div>
      <v-chip
        v-for="ip in data.ipv4"
        :key="ip"
        size="small"
        variant="tonal"
        class="me-1 mb-1 font-mono"
        >{{ ip }}</v-chip
      >
    </div>
    <div v-if="data?.ipv6?.length">
      <div class="text-caption text-medium-emphasis mb-1">{{ t('ip.ipv6') }}</div>
      <v-chip
        v-for="ip in data.ipv6"
        :key="ip"
        size="small"
        variant="tonal"
        class="me-1 mb-1 font-mono"
        >{{ ip }}</v-chip
      >
    </div>
  </div>
</template>

<style scoped>
.font-mono {
  font-family: 'SF Mono', 'Menlo', monospace;
}
</style>
