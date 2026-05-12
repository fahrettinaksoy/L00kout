import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Demoted to warn so legacy code does not block CI; new code should still
    // avoid these. Promote back to "error" once the warnings backlog is
    // worked through.
    'no-empty': ['warn', { allowEmptyCatch: true }],
    'import/no-duplicates': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
  ignores: ['node_modules', '.nuxt', '.output', 'dist', 'coverage', 'public'],
})
