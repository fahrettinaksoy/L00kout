/**
 * Conventional Commits enforcement.
 *
 * Format: <type>(<scope>)?: <subject>
 *
 *   feat:        new user-facing feature        → minor
 *   fix:         bug fix                        → patch
 *   perf:        performance improvement        → patch
 *   refactor:    internal change, no behaviour  → patch
 *   docs:        documentation only             → patch
 *   test:        test only                      → no release
 *   chore:       maintenance, deps, tooling     → no release
 *   ci:          CI / workflow change           → no release
 *   build:       build system change            → no release
 *   style:       formatting only                → no release
 *
 * Add `BREAKING CHANGE:` in the body for a major bump.
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'refactor',
        'docs',
        'test',
        'chore',
        'ci',
        'build',
        'style',
        'revert',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [1, 'always', 120],
  },
}
