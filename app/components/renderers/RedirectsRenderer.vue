<script setup lang="ts">
defineProps<{ data: any }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <v-chip size="small" variant="tonal" class="mb-2">{{
      t('redirects.count', { n: data?.count ?? 0 })
    }}</v-chip>
    <v-timeline density="compact" side="end" truncate-line="both">
      <v-timeline-item
        v-for="(hop, i) in (data?.chain ?? []).slice(0, 5)"
        :key="i"
        size="x-small"
        :dot-color="hop.status >= 200 && hop.status < 300 ? 'success' : 'info'"
      >
        <div class="text-caption text-truncate" style="max-width: 250px">
          <span class="font-weight-medium">{{ hop.status }}</span> {{ hop.url }}
        </div>
      </v-timeline-item>
    </v-timeline>
  </div>
</template>
