<script setup lang="ts">
const props = defineProps<{ data: any }>()
const { t } = useI18n()

const ogCount = computed(() => Object.keys(props.data?.og ?? {}).length)
const twCount = computed(() => Object.keys(props.data?.twitter ?? {}).length)
const title = computed(() => props.data?.og?.title || props.data?.title || '')
const description = computed(() => props.data?.og?.description || props.data?.description || '')
const image = computed(() => props.data?.og?.image || props.data?.twitter?.image || null)
</script>

<template>
  <div class="social-row">
    <div class="social-image">
      <v-img v-if="image" :src="image" cover class="rounded" aspect-ratio="1" />
      <div v-else class="social-image__placeholder">
        <v-icon icon="mdi-image-off-outline" size="32" color="grey" />
      </div>
    </div>

    <div class="social-content">
      <div class="text-subtitle-1 font-weight-medium">{{ title || '—' }}</div>
      <div v-if="description" class="text-body-2 text-medium-emphasis mt-1 desc">
        {{ description }}
      </div>

      <div v-if="data?.canonical" class="canonical mt-3">
        <v-icon icon="mdi-link-variant" size="14" class="me-1" />
        <a
          :href="data.canonical"
          target="_blank"
          rel="noopener"
          class="text-primary text-decoration-none text-truncate"
        >
          {{ data.canonical }}
        </a>
      </div>

      <div class="d-flex flex-wrap ga-2 mt-3">
        <v-chip v-if="ogCount" size="x-small" variant="tonal" color="primary">
          <v-icon icon="mdi-facebook" start size="12" />
          Open Graph · {{ ogCount }}
        </v-chip>
        <v-chip v-if="twCount" size="x-small" variant="tonal" color="info">
          <v-icon icon="mdi-twitter" start size="12" />
          Twitter · {{ twCount }}
        </v-chip>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.social-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.social-image {
  flex-shrink: 0;
  width: 220px;
  max-width: 40%;
  &__placeholder {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(127, 127, 127, 0.08);
    border: 1px solid rgba(127, 127, 127, 0.16);
    border-radius: 8px;
  }
}
.social-content {
  flex: 1 1 0;
  min-width: 0;
}
.desc {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}
.canonical {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  a {
    font-family: 'SF Mono', 'Menlo', monospace;
    display: block;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .social-row {
    flex-direction: column;
  }
  .social-image {
    width: 100%;
    max-width: 220px;
  }
}
</style>
