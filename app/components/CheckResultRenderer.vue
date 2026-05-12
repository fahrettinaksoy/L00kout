<script setup lang="ts">
import { defineAsyncComponent, type Component } from 'vue'
import { checkIdFromRendererPath } from '~/composables/useCheckStatus'

const props = defineProps<{ id: string; data: unknown }>()

/**
 * Auto-load every `*Renderer.vue` in ./renderers via Vite's import.meta.glob.
 * The check id is derived from the file name (PascalCase → kebab-case minus
 * "Renderer"). Adding a new check therefore only requires dropping a
 * `<Name>Renderer.vue` into the renderers/ folder — no manual registration.
 */
const modules = import.meta.glob<{ default: Component }>('./renderers/*Renderer.vue')

const customRenderers: Record<string, () => Promise<Component>> = Object.fromEntries(
  Object.entries(modules).map(([path, loader]) => [
    checkIdFromRendererPath(path),
    () => loader().then((m) => m.default),
  ]),
)

const renderer = computed<Component | null>(() => {
  const loader = customRenderers[props.id]
  return loader ? defineAsyncComponent(loader) : null
})
</script>

<template>
  <component :is="renderer" v-if="renderer" :data="data" />
  <GenericResultRenderer v-else :data="data" />
</template>
