# Architecture Decision Records

Each ADR records a single significant decision: the context, the choice we
made, the alternatives we rejected, and the consequences. ADRs are
immutable once accepted — instead of editing one, we write a new one that
supersedes it.

## Index

| #                                                  | Title                                                     | Status   |
| -------------------------------------------------- | --------------------------------------------------------- | -------- |
| [0001](0001-defineCheck-wrapper.md)                | `defineCheck` wrapper for endpoint cross-cutting concerns | Accepted |
| [0002](0002-error-code-taxonomy.md)                | Error code taxonomy + i18n on the client                  | Accepted |
| [0003](0003-zod-upstream-validation.md)            | Zod for upstream API response validation                  | Accepted |
| [0004](0004-convention-based-renderer-registry.md) | Convention-based renderer registry via `import.meta.glob` | Accepted |

## Template

```md
# NNNN — Short title

**Status**: Proposed | Accepted | Superseded by ADR NNNN
**Date**: YYYY-MM-DD

## Context

Why is this decision needed? What constraints are in play?

## Decision

What did we decide? Be concrete.

## Alternatives considered

- Option A — why rejected
- Option B — why rejected

## Consequences

Positive and negative outcomes; what now needs to be maintained or
revisited.
```
