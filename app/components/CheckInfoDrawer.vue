<script setup lang="ts">
const { openCheckId, isOpen, close } = useInfoDrawer()
const { byId, categoryMeta } = useCheckRegistry()
const { t, te } = useI18n()

const meta = computed(() => (openCheckId.value ? byId(openCheckId.value) : null))
const catMeta = computed(() => (meta.value ? categoryMeta[meta.value.category] : null))

const hasInfo = computed(() =>
  openCheckId.value ? te(`info.${openCheckId.value}.concept`) : false,
)
</script>

<template>
  <v-navigation-drawer
    v-model="isOpen"
    location="right"
    temporary
    width="480"
    color="surface"
    class="info-drawer border-0 elevation-12"
  >
    <div v-if="meta" class="d-flex flex-column h-100">
      <div class="pa-5 d-flex align-start ga-3 border-b">
        <v-avatar v-if="catMeta" :color="catMeta.color" variant="tonal" size="48">
          <v-icon :icon="meta.icon" size="24" />
        </v-avatar>
        <div class="flex-grow-1 min-width-0">
          <div class="text-overline text-medium-emphasis">
            {{ t(`categories.${meta.category}`) }}
          </div>
          <div class="text-h6 font-weight-bold">
            {{ t(`checks.${meta.id}.title`) }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ t(`checks.${meta.id}.description`) }}
          </div>
        </div>
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </div>

      <div class="pa-5 flex-grow-1 overflow-auto">
        <template v-if="hasInfo">
          <div class="info-section mb-5">
            <div class="info-section__head">
              <v-icon icon="mdi-help-circle-outline" color="primary" size="18" />
              <span>{{ t('common.concept') }}</span>
            </div>
            <p class="text-body-2 mt-2">{{ t(`info.${meta.id}.concept`) }}</p>
          </div>

          <div class="info-section mb-5">
            <div class="info-section__head">
              <v-icon icon="mdi-target" color="secondary" size="18" />
              <span>{{ t('common.purpose') }}</span>
            </div>
            <p class="text-body-2 mt-2">{{ t(`info.${meta.id}.purpose`) }}</p>
          </div>

          <div class="info-section">
            <div class="info-section__head">
              <v-icon icon="mdi-lightbulb-on-outline" color="warning" size="18" />
              <span>{{ t('common.tips') }}</span>
            </div>
            <p class="text-body-2 mt-2">{{ t(`info.${meta.id}.tips`) }}</p>
          </div>
        </template>
        <div v-else class="text-caption text-medium-emphasis">
          {{ t('common.noResults') }}
        </div>

        <v-divider class="my-5" />

        <div class="d-flex flex-column ga-2">
          <div class="d-flex justify-space-between text-caption">
            <span class="text-medium-emphasis">Endpoint</span>
            <code class="text-body-2">{{ meta.endpoint }}</code>
          </div>
          <div v-if="meta.estimatedMs" class="d-flex justify-space-between text-caption">
            <span class="text-medium-emphasis">~</span>
            <span>{{ (meta.estimatedMs / 1000).toFixed(1) }}s</span>
          </div>
          <div v-if="meta.requiresKey" class="d-flex justify-space-between text-caption">
            <span class="text-medium-emphasis">API key</span>
            <v-chip size="x-small" color="warning" variant="tonal">required</v-chip>
          </div>
          <div v-if="meta.heavy" class="d-flex justify-space-between text-caption">
            <span class="text-medium-emphasis">heavy</span>
            <v-chip size="x-small" color="info" variant="tonal">slow</v-chip>
          </div>
        </div>
      </div>

      <div class="drawer-footer">
        <v-btn variant="tonal" prepend-icon="mdi-close" class="footer-btn" @click="close">
          {{ t('common.close') }}
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<style scoped lang="scss">
.border-b {
  border-bottom: 1px solid rgba(127, 127, 127, 0.2);
}
.min-width-0 {
  min-width: 0;
}
.info-section {
  &__head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(var(--v-theme-on-surface), 0.75);
  }
  p {
    line-height: 1.6;
    color: rgba(var(--v-theme-on-surface), 0.92);
  }
}
code {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 0.75rem;
  color: rgb(var(--v-theme-primary));
}
.drawer-footer {
  padding: 12px 20px;
  border-top: 1px solid rgba(127, 127, 127, 0.2);
  background: rgb(var(--v-theme-surface));
  flex-shrink: 0;
}
.footer-btn {
  min-width: 140px;
}
</style>

<style>
/* Position the info drawer full viewport height, above the app bar */
.info-drawer.v-navigation-drawer--temporary {
  top: 0 !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  z-index: 2000 !important;
}
</style>
