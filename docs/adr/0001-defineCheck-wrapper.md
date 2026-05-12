# 0001 — `defineCheck` wrapper for endpoint cross-cutting concerns

**Status**: Accepted
**Date**: 2026-05-12

## Context

The 31 check endpoints under `server/api/checks/` originally repeated the
same boilerplate in every file:

```ts
export default defineEventHandler(async (event) => {
  const target = getTarget(event)
  try {
    /* logic */
  } catch (e: any) {
    throw createError({ statusCode: 502, statusMessage: e.message })
  }
})
```

This left no place to add logging, timing, error mapping, SSRF protection,
or metrics without touching every endpoint. The `statusMessage: e.message`
pattern also leaked internal error text to the client.

## Decision

Introduce `defineCheck({ id, ssrfGuard?, handler })` (`server/utils/defineCheck.ts`).
The wrapper handles input validation, optional SSRF check, timing,
structured logging, Prometheus counters, Sentry forwarding for unexpected
errors, and `AppError → h3` mapping. Every endpoint now reads as:

```ts
export default defineCheck({
  id: 'ssl',
  ssrfGuard: true,
  handler: async ({ target }) => {
    /* logic */
  },
})
```

## Alternatives considered

- **h3 middleware** — would centralise logging but not the input-shape
  contract; each endpoint would still need to parse target manually.
- **One handler per file, copy-paste discipline** — what we had. Drift
  is inevitable; we already saw 502 mappings vary across files.
- **Decorator pattern with classes** — overkill for stateless endpoints
  and incompatible with Nitro's file-based routing.

## Consequences

- Adding a cross-cutting concern is now one diff in one file.
- New endpoints follow a single template (see README contribution guide).
- The wrapper hides the underlying h3 event — endpoints that genuinely
  need it can destructure `{ event }` from the handler context.
- `defineCheck` is the integration point for future concerns
  (rate-limit-per-check, response caching, OpenTelemetry spans).
