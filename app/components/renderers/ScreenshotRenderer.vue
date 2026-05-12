<script setup lang="ts">
defineProps<{ data: any }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <v-img v-if="data?.imageUrl" :src="data.imageUrl" aspect-ratio="16/10" cover class="rounded">
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="primary" size="24" />
        </div>
      </template>
    </v-img>
    <div v-else class="text-caption text-medium-emphasis">
      {{ data?.hint || t('screenshot.failed') }}
    </div>
    <div v-if="data?.provider" class="text-caption text-medium-emphasis mt-1">
      {{ t('screenshot.via', { provider: data.provider }) }}
    </div>
  </div>
</template>
