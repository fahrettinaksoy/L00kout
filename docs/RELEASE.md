# Release & Branching Workflow

This project uses a **trunk-based workflow** with **Conventional Commits** and
**semantic-release** for fully automated versioning, tagging and changelog
generation.

## TL;DR

1. Branch off `main` → `feat/<thing>` or `fix/<thing>`.
2. Open a PR with a Conventional-Commit title.
3. CI (`quality → build/docs → e2e`) must be green.
4. Squash-merge into `main`.
5. The `Release` workflow tags a new version, updates `CHANGELOG.md`, and
   publishes a GitHub Release — all automatic.

You never edit `package.json` `version` or `CHANGELOG.md` by hand.

## Branching strategy

```text
main      ─────●─────●─────●─────●─────●─── (always releasable)
                \         /     \
feat/x           ●───────●       \
                                   ●───────● fix/y
```

- `main` is **protected**: no direct pushes; PR + green CI required.
- Feature branches are short-lived (< 2 days ideal). Rebase on `main` before
  merging if it drifts.
- Squash-merge is the default; the squash commit message **must** follow
  Conventional Commits (the PR title is reused).

## Conventional Commit cheat-sheet

| Type        | Effect on version | Use for                       |
| ----------- | ----------------- | ----------------------------- |
| `feat:`     | **minor** (x.Y.0) | New user-facing feature       |
| `fix:`      | **patch** (x.y.Z) | Bug fix                       |
| `perf:`     | patch             | Performance improvement       |
| `refactor:` | patch             | Internal change, no behaviour |
| `docs:`     | patch             | Documentation only            |
| `test:`     | no release        | Test only                     |
| `chore:`    | no release        | Tooling / deps / housekeeping |
| `ci:`       | no release        | CI / workflow change          |
| `build:`    | no release        | Build system change           |
| `style:`    | no release        | Formatting only               |

**Breaking changes** — append `!` after the type or include
`BREAKING CHANGE:` in the body — trigger a **major** (X.0.0) bump:

```text
feat(api)!: rename /api/checks/x to /api/checks/y

BREAKING CHANGE: clients calling /api/checks/x must migrate to /api/checks/y.
```

## Scopes (optional but encouraged)

- `dns`, `ssl`, `whois`, `malware`, … (per-check)
- `ssrf`, `rate-limit`, `errors`, `metrics`, `cache`, `i18n`, `ui`
- `ci`, `deps`, `release`

Example: `fix(rate-limit): respect X-Forwarded-For with multiple hops`.

## Pull request flow

```bash
git switch -c feat/<short-slug>           # branch off main
# ... make changes ...
npm run ci                                # lint + format + typecheck + test
git commit -m "feat(<scope>): <subject>"  # commitlint validates
git push -u origin feat/<short-slug>
# open PR in GitHub Desktop or via gh:
gh pr create --fill
```

PR title **must** match Conventional Commits — the squash-merge inherits it.

## How releases happen

```text
PR merged → main updates → CI runs → Release workflow runs:
  1. wait-on-check-action waits for `quality` job to be green
  2. semantic-release reads commits since last tag
  3. computes next version (major / minor / patch)
  4. writes CHANGELOG.md
  5. commits `chore(release): vX.Y.Z [skip ci]`
  6. pushes a `vX.Y.Z` git tag
  7. creates a GitHub Release with auto-generated notes
```

Commits with the prefix `chore(release):` are ignored by the workflow itself
so the release commit doesn't trigger another release.

## Required GitHub settings (one-time)

1. **Settings → Branches → Add rule for `main`:**
   - ✅ Require a pull request before merging.
   - ✅ Require status checks: `quality`, `build`, `e2e`.
   - ✅ Require branches to be up to date before merging.
   - ✅ Require linear history (squash-only).
   - ❌ Do not allow bypassing.
2. **Settings → Actions → General → Workflow permissions:**
   - ✅ Read and write permissions.
   - ✅ Allow GitHub Actions to create and approve pull requests.
3. (Optional) Add a **Personal Access Token** as `GH_TOKEN` repository
   secret if you want semantic-release to bypass branch protection on its
   `chore(release):` commit. Without it, the workflow uses
   `${{ secrets.GITHUB_TOKEN }}` which respects branch protection — in
   which case temporarily allow GitHub Actions in the branch rule.

## Hot-fix on a released version

```bash
git switch -c fix/<slug> v1.2.3
# ... fix ...
git commit -m "fix(<scope>): <subject>"
git push -u origin fix/<slug>
# open PR against main
```

A hotfix is just another `fix:` PR — semantic-release will issue the next
patch version automatically. There are no long-lived `release/*` branches.

## Local dev hooks

- `pre-commit` → `lint-staged` runs ESLint + Prettier on changed files.
- `commit-msg` → `commitlint` rejects non-conformant commit messages.
- Both are installed via `npm install` (Husky `prepare` script).

If a hook is too strict for a WIP commit, use:

```bash
git commit -m "..." --no-verify    # bypasses husky locally; CI still enforces.
```

CI will still reject a non-Conventional Commit at PR merge time via the PR
title check, so prefer fixing the message over bypassing the hook.
