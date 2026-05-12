<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t } = useI18n()
const input = ref('')
const error = ref('')
const router = useRouter()

const submit = () => {
  error.value = ''
  const target = parseTarget(input.value)
  if (!target) {
    error.value = t('landing.invalid')
    return
  }
  router.push(`/dashboard/${encodeURIComponent(target.hostname)}`)
}

const examples = ['github.com', 'cloudflare.com', 'wikipedia.org']
</script>

<template>
  <div class="hero">
    <div class="hero__bg" />
    <v-container class="hero__content">
      <div class="d-flex justify-end mb-4 ga-2">
        <ThemeSwitcher />
        <LangSwitcher />
      </div>

      <div class="text-center mb-8">
        <v-icon icon="mdi-radar" color="primary" size="64" class="mb-4" />
        <h1 class="text-h2 font-weight-bold mb-3">
          <span class="gradient-text">{{ $t('common.appName') }}</span>
        </h1>
        <p class="text-h6 text-medium-emphasis mb-2">{{ $t('common.tagline') }}</p>
        <p class="text-body-2 text-medium-emphasis">{{ $t('common.subtagline') }}</p>
      </div>

      <v-card max-width="640" class="mx-auto pa-6 glass">
        <v-form @submit.prevent="submit">
          <v-text-field
            v-model="input"
            :label="$t('landing.inputLabel')"
            :placeholder="$t('landing.inputPlaceholder')"
            prepend-inner-icon="mdi-web"
            :error-messages="error"
            autofocus
            class="mb-3"
          />
          <v-btn type="submit" color="primary" size="large" block append-icon="mdi-arrow-right">
            {{ $t('landing.submit') }}
          </v-btn>
        </v-form>

        <div class="mt-6">
          <div class="text-caption text-medium-emphasis mb-2">{{ $t('landing.examples') }}</div>
          <div class="d-flex ga-2 flex-wrap">
            <v-chip
              v-for="ex in examples"
              :key="ex"
              size="small"
              variant="tonal"
              @click="
                input = ex
                submit()
              "
            >
              {{ ex }}
            </v-chip>
          </div>
        </div>
      </v-card>

      <div class="mt-12">
        <CategoryShowcase />
      </div>
    </v-container>
  </div>
</template>

<style scoped lang="scss">
.hero {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: 64px 0;
  overflow: hidden;

  &__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at top, rgba(91, 141, 239, 0.18), transparent 50%),
      radial-gradient(ellipse at bottom right, rgba(34, 211, 238, 0.12), transparent 50%);
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 1;
  }
}
</style>
