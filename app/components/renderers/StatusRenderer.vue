<script setup lang="ts">
defineProps<{ data: any }>()
const { t } = useI18n()
</script>

<template>
  <div class="d-flex align-center ga-3">
    <v-avatar :color="data?.online ? 'success' : 'error'" size="48" variant="flat">
      <v-icon :icon="data?.online ? 'mdi-check' : 'mdi-close'" color="white" />
    </v-avatar>
    <div>
      <div class="text-h6 font-weight-bold">{{ data?.statusCode }} {{ data?.statusText }}</div>
      <div class="text-caption text-medium-emphasis">
        {{ t('status.responseTime', { n: data?.responseTimeMs }) }}
      </div>
    </div>
  </div>
</template>
