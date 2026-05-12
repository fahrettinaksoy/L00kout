# 0002 — Error code taxonomy + client-side i18n

**Status**: Accepted
**Date**: 2026-05-12

## Context

Original endpoints threw `createError({ statusCode: 502, statusMessage: e.message })`,
which exposed internal error text — sometimes in Turkish, sometimes in
English — to the client. The client then rendered the raw `statusMessage`.
This had two problems: localisation was impossible without a string lookup
table on the client, and internal stack traces or library messages could
leak (e.g. database connection strings, OS-specific paths).

## Decision

1. Define a closed set of `ErrorCode` strings in `server/utils/errors.ts`:
   `INVALID_INPUT`, `SSRF_BLOCKED`, `UPSTREAM_TIMEOUT`,
   `UPSTREAM_HTTP_ERROR`, `RATE_LIMITED`, `INTERNAL_ERROR`, etc.
2. Endpoints throw `new AppError(code, status, context)`.
3. `toH3Error()` maps any thrown value to an h3 error where
   `statusMessage` is always the code (never raw text) and `data.code` +
   `data.context` carry the structured payload.
4. The client's `useCheckError()` composable resolves
   `t('errors.' + code, context)` for display. Both `tr.json` and
   `en.json` define an `errors.*` block with parameter interpolation
   (`UPSTREAM_TIMEOUT: "Timeout ({seconds}s)"`).

## Alternatives considered

- **Free-form English messages** — what most APIs do; rejected because
  this app is bilingual by design.
- **Per-endpoint error subtypes** — rejected as over-engineering; the
  same handful of failure modes recur across endpoints.
- **HTTP status alone** — too coarse; `RATE_LIMITED` and
  `SSRF_BLOCKED` are both 4xx but want very different UI.

## Consequences

- Adding a new translation = one entry in `errors.*`. No code change.
- Server never leaks internal text — `INTERNAL_ERROR` is the
  catch-all and prompts a Sentry report.
- Endpoints become more declarative: failure mode is part of the
  contract, not an ad-hoc string.
- Coordinated change: introducing a new error code requires updating
  the `ErrorCode` union, both locale files, and (optionally) the
  Prometheus label set in `metrics.ts`.
