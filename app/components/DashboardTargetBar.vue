<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const input = ref(decodeURIComponent((route.params.target as string) ?? ''))

watch(
  () => route.params.target,
  (v) => {
    if (typeof v === 'string') input.value = decodeURIComponent(v)
  },
)

const submit = () => {
  const t = parseTarget(input.value)
  if (!t) return
  router.push(`/dashboard/${encodeURIComponent(t.hostname)}`)
}
</script>

<template>
  <v-form class="d-flex align-center flex-grow-1 me-4 target-form" @submit.prevent="submit">
    <v-text-field
      v-model="input"
      density="compact"
      hide-details
      variant="outlined"
      :placeholder="$t('dashboard.searchPlaceholder')"
      prepend-inner-icon="mdi-magnify"
      append-inner-icon="mdi-arrow-right"
      class="target-input"
      @click:append-inner="submit"
    >
      <template #prepend-inner>
        <div class="d-flex align-center ga-2 me-2">
          <v-icon icon="mdi-magnify" size="20" />
          <span class="text-caption text-medium-emphasis url-prefix">https://</span>
        </div>
      </template>
    </v-text-field>
  </v-form>
</template>

<style scoped lang="scss">
.target-form {
  /* Align input's left edge with content area "All" icon (sidebar edge + pa-6) */
  padding-left: 0px;
}
.target-input {
  width: 100%;
  max-width: 640px;
}
:deep(.target-input .v-field__prepend-inner) {
  padding-inline-start: 4px;
}
.url-prefix {
  font-family: 'SF Mono', 'Menlo', monospace;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.12);
  white-space: nowrap;
  user-select: none;
}
</style>
