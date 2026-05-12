<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const current = computed(() => (locales.value as any[]).find((l) => l.code === locale.value))
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        size="small"
        :icon="true"
        :title="current?.name || locale"
      >
        <span class="flag">{{ current?.flag || '🌐' }}</span>
      </v-btn>
    </template>
    <v-list density="compact" nav min-width="160">
      <v-list-item
        v-for="l in locales as any[]"
        :key="l.code"
        :active="l.code === locale"
        @click="setLocale(l.code as any)"
      >
        <template #prepend>
          <span class="flag me-2">{{ l.flag }}</span>
        </template>
        <v-list-item-title>{{ l.name }}</v-list-item-title>
        <template #append>
          <v-icon v-if="l.code === locale" icon="mdi-check" color="primary" size="18" />
        </template>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.flag {
  font-size: 1.1rem;
  line-height: 1;
  display: inline-block;
}
</style>
