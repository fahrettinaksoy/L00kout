<script setup lang="ts">
const props = defineProps<{ data: unknown }>()
const { locale } = useI18n()

const isPrimitive = (v: unknown) => v === null || ['string', 'number', 'boolean'].includes(typeof v)

const entries = computed(() => {
  if (!props.data || typeof props.data !== 'object') return []
  return Object.entries(props.data as Record<string, unknown>).slice(0, 8)
})

const formatValue = (v: unknown) => {
  if (v === null || v === undefined) return '—'
  if (typeof v === 'boolean')
    return v ? (locale.value === 'tr' ? 'Evet' : 'Yes') : locale.value === 'tr' ? 'Hayır' : 'No'
  if (Array.isArray(v)) return locale.value === 'tr' ? `${v.length} öğe` : `${v.length} items`
  if (typeof v === 'object') return locale.value === 'tr' ? 'Nesne' : 'Object'
  return String(v)
}
</script>

<template>
  <div v-if="isPrimitive(data)" class="text-body-2">{{ formatValue(data) }}</div>
  <div v-else-if="Array.isArray(data)" class="text-body-2">
    <v-chip
      v-for="(item, i) in (data as unknown[]).slice(0, 6)"
      :key="i"
      size="small"
      variant="tonal"
      class="me-1 mb-1"
    >
      {{ typeof item === 'object' ? JSON.stringify(item).slice(0, 40) : String(item) }}
    </v-chip>
    <span v-if="(data as unknown[]).length > 6" class="text-caption text-medium-emphasis">
      +{{ (data as unknown[]).length - 6 }}
    </span>
  </div>
  <v-table v-else density="compact" class="bg-transparent">
    <tbody>
      <tr v-for="[k, v] in entries" :key="k">
        <td class="text-caption text-medium-emphasis" style="width: 40%">{{ k }}</td>
        <td class="text-body-2 text-truncate" style="max-width: 220px">{{ formatValue(v) }}</td>
      </tr>
    </tbody>
  </v-table>
</template>
