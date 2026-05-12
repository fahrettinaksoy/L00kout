<template>
  <v-app>
    <v-app-bar :elevation="0" color="surface" class="border-0">
      <template #prepend>
        <NuxtLink to="/" class="d-flex align-center px-4 text-decoration-none logo-slot">
          <v-icon icon="mdi-radar" color="primary" size="28" class="me-2" />
          <span class="text-h6 font-weight-bold gradient-text">L00kout</span>
        </NuxtLink>
      </template>

      <DashboardTargetBar />

      <template #append>
        <ThemeSwitcher class="me-2" />
        <LangSwitcher class="me-2" />
        <v-btn
          class="ms-2"
          icon="mdi-github"
          variant="text"
          size="small"
          href="https://github.com"
          target="_blank"
        />
      </template>
    </v-app-bar>

    <v-navigation-drawer
      permanent
      width="280"
      color="surface"
      class="d-none d-md-flex sidebar-drawer border-0"
    >
      <DashboardSidebar />
    </v-navigation-drawer>

    <v-main>
      <v-container fluid class="pa-6">
        <slot />
      </v-container>
    </v-main>

    <CheckInfoDrawer />
  </v-app>
</template>

<style scoped>
.logo-slot {
  width: 280px;
  height: 100%;
}
</style>

<style>
/* SSR/hydration: pre-position the permanent sidebar and reserve v-main space
   before Vuetify finishes computing the layout. Eliminates the flash where
   the drawer renders narrow on top of header content on first paint. */
@media (min-width: 960px) {
  .v-application__wrap > .v-main {
    --v-layout-left: 280px;
    padding-left: 280px;
  }
  .v-navigation-drawer.sidebar-drawer {
    width: 280px !important;
    transform: translateX(0) !important;
    top: 64px !important;
    height: calc(100vh - 64px) !important;
    visibility: visible !important;
  }
  .v-app-bar {
    z-index: 1006 !important;
  }
}
</style>
