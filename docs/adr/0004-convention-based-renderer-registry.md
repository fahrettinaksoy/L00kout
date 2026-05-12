# 0004 — Convention-based renderer registry

**Status**: Accepted
**Date**: 2026-05-12

## Context

`CheckResultRenderer.vue` originally maintained a 32-entry map of
`checkId → () => import('./renderers/XRenderer.vue')`. Adding a new
check required four coordinated edits: server endpoint, registry
metadata, locale strings, _and_ this map. The map drifted at least
twice during development — renderers were added without an entry and
silently fell back to `GenericResultRenderer`.

## Decision

Replace the manual map with Vite's `import.meta.glob('./renderers/*Renderer.vue')`
and derive the check id from the filename via
`checkIdFromRendererPath()` (e.g. `HttpSecurityRenderer.vue` →
`http-security`). The function lives in `app/composables/useCheckStatus.ts`
so it's unit-testable in isolation.

## Alternatives considered

- **Manual map** — what we had; brittle, easy to forget.
- **Centralised TypeScript registry per check** (single object with
  `meta`, `endpoint`, `renderer`) — clean, but requires _more_
  ceremony for the common case of "just drop a renderer".
- **Component name-based auto-resolve** — works in Nuxt, but doesn't
  give us lazy loading per renderer.

## Consequences

- Adding a check renderer is now a one-file change.
- The naming convention (`<PascalCheckId>Renderer.vue`) is now part of
  the contract — tests assert the derivation rules for the seven
  multi-word ids.
- Vite still emits one chunk per renderer — bundle size unchanged.
- Failure mode: if a renderer is missing, the check still works via
  `GenericResultRenderer`. Misnamed files (e.g. `Renderer-X.vue`)
  silently won't auto-load — guard via lint or directory test if this
  becomes a problem.
