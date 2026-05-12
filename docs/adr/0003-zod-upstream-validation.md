# 0003 — Zod for upstream API response validation

**Status**: Accepted
**Date**: 2026-05-12

## Context

Pre-P1 every endpoint parsed third-party JSON with `await res.json() as any`
and then read nested fields with optional chaining. When an upstream
provider changed its schema, the failure mode was a silent `undefined`
that bubbled into the UI as `null` everywhere — debugging required
correlating user reports with provider changelogs.

## Decision

Introduce `fetchJson<T>(url, zodSchema, opts)` in `server/utils/upstream.ts`.
Endpoints declare the expected shape with Zod and the helper:

- Issues the fetch with the standard timeout.
- Maps low-level failures to `UPSTREAM_UNAVAILABLE`.
- Maps non-2xx to `UPSTREAM_HTTP_ERROR{status}`.
- `safeParse`s the body; mismatches throw `UPSTREAM_HTTP_ERROR{reason: 'schema-mismatch', issues}`.

Validation failures _always_ throw and are reported to Sentry — a
malformed upstream is a bug, not a user-facing soft fail.

Applied initially to `location.get.ts` (ip-api.com, restcountries.com)
and `malware.get.ts` (Google Safe Browsing, URLhaus, ThreatFox). The
remaining endpoints will migrate incrementally.

## Alternatives considered

- **TypeBox / Valibot** — equally capable; Zod won on familiarity in
  the JS ecosystem.
- **Hand-rolled type guards** — more verbose, no parameter
  interpolation in the error path.
- **Skip validation, trust providers** — what we had; rejected because
  free-tier providers (`restcountries.com`, `abuse.ch`) have changed
  schemas without notice in the past.

## Consequences

- The first `any` in the upstream parse chain is gone.
- Bundle cost: ~12 KB gzipped for Zod (acceptable given the value).
- New endpoints declaring a Zod schema get a typed payload for free —
  no `as any` casts on `data`.
- Schema mismatches are observable: counter
  `l00kout_upstream_errors_total{code=UPSTREAM_HTTP_ERROR}` will spike
  the first time a provider changes its response.
