<script setup lang="ts">
const { categories, byCategory, categoryMeta } = useCheckRegistry()
const { t } = useI18n()
</script>

<template>
  <v-row dense>
    <v-col v-for="cat in categories" :key="cat" cols="12" sm="6" md="4" lg="3">
      <v-card class="pa-4 h-100" variant="tonal" :color="categoryMeta[cat].color">
        <div class="d-flex align-center mb-2">
          <v-icon :icon="categoryMeta[cat].icon" class="me-2" />
          <span class="text-subtitle-1 font-weight-medium">{{ t(`categories.${cat}`) }}</span>
          <v-spacer />
          <v-chip size="x-small" variant="flat">{{ byCategory(cat).length }}</v-chip>
        </div>
        <div class="text-caption text-medium-emphasis">
          {{
            byCategory(cat)
              .map((c) => t(`checks.${c.id}.title`))
              .slice(0, 3)
              .join(' · ')
          }}{{ byCategory(cat).length > 3 ? '…' : '' }}
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
