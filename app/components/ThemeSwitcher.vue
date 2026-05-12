<script setup lang="ts">
import { useTheme } from 'vuetify'

const theme = useTheme()
const { t } = useI18n()

const STORAGE_KEY = 'l00kout_theme'
const DARK = 'l00koutDark'
const LIGHT = 'l00koutLight'

onMounted(() => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === DARK || stored === LIGHT) {
    theme.global.name.value = stored
    return
  }
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  theme.global.name.value = prefersDark ? DARK : LIGHT
})

const isDark = computed(() => theme.global.current.value.dark)

const toggle = () => {
  const next = isDark.value ? LIGHT : DARK
  theme.global.name.value = next
  if (import.meta.client) localStorage.setItem(STORAGE_KEY, next)
}
</script>

<template>
  <v-btn
    variant="text"
    size="small"
    :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
    :title="t('common.theme')"
    @click="toggle"
  />
</template>
