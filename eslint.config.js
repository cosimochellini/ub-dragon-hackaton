//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks'
import eslintReact from '@eslint-react/eslint-plugin'
import reactDoctor from 'eslint-plugin-react-doctor'
import unicorn from 'eslint-plugin-unicorn'

/** React-specific rule sets only lint application source. */
const REACT_FILES = ['src/**/*.{ts,tsx}']
/** All hand-written source (React rules + general JS/TS hardening). */
const SOURCE_FILES = ['src/**/*.{js,ts,tsx}']
/** Test files and test scaffolding. */
const TEST_FILES = ['**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}']

/** @type {import('eslint').Linter.Config[]} */
const config = [
  // TanStack baseline: typescript-eslint, import-x, n, stylistic (type-aware).
  ...tanstackConfig,

  // Global ignores: generated output and config files are not linted.
  {
    ignores: [
      'eslint.config.js',
      'prettier.config.js',
      'src/routeTree.gen.ts',
      'netlify/**',
      'dist/**',
    ],
  },

  // unicorn: strong, framework-agnostic JS/TS hardening.
  { ...unicorn.configs.recommended, files: SOURCE_FILES },

  // React Compiler + Rules of Hooks (official, authoritative).
  { ...reactHooks.configs.flat.recommended, files: REACT_FILES },

  // @eslint-react: deep TypeScript-aware React 19 correctness rules.
  { ...eslintReact.configs['recommended-typescript'], files: REACT_FILES },

  // React Doctor: security / performance / a11y / architecture, plus the
  // TanStack Start and TanStack Query framework rule packs.
  { ...reactDoctor.configs.recommended, files: REACT_FILES },
  { ...reactDoctor.configs['tanstack-start'], files: REACT_FILES },
  { ...reactDoctor.configs['tanstack-query'], files: REACT_FILES },

  // Inherited from the original config; intentionally relaxed.
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
      'pnpm/json-enforce-catalog': 'off',
    },
  },

  // unicorn rules tuned to this project's conventions.
  {
    files: SOURCE_FILES,
    rules: {
      // Components are PascalCase; libs/integrations use kebab-case; helpers camelCase.
      'unicorn/filename-case': [
        'error',
        { cases: { camelCase: true, pascalCase: true, kebabCase: true } },
      ],
      // `null` is idiomatic here: useRef(null), JSON data, DOM APIs, nullable models.
      'unicorn/no-null': 'off',
      // Prettier owns ternary formatting; the two disagree on parenthesization.
      'unicorn/no-nested-ternary': 'off',
      // Too aggressive for React (props, ref, params, prev, fn, etc.).
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  // React rules tuned to this project (each off-switch is a deliberate trade-off).
  {
    files: REACT_FILES,
    rules: {
      // The React Compiler is not enabled in this build, so manual memoization
      // (useMemo/useCallback) is intentional and correct here.
      'react-doctor/react-compiler-no-manual-memoization': 'off',
      // Fires on legitimate cross-component selection-sync and DOM side-effect
      // effects (e.g. focus management, scroll-into-view), not real anti-patterns.
      'react-doctor/no-event-handler': 'off',
      // The screen's UI states are genuinely independent; a single reducer would
      // couple them without benefit.
      'react-doctor/prefer-useReducer': 'off',
      // `useEffectEvent` is still experimental; not adopting it in this POC.
      'react-doctor/prefer-use-effect-event': 'off',
      // The booking sheet is a custom modal that already implements its own focus
      // trap + Escape handling; a native <dialog> migration is out of scope here.
      'react-doctor/prefer-html-dialog': 'off',
      'react-doctor/prefer-tag-over-role': 'off',
      // Components deliberately co-locate small pure helpers; the Fast Refresh
      // boundary is not a concern for this SSR build.
      'react-doctor/only-export-components': 'off',
    },
  },

  // Test files: relax rules that don't apply to test scaffolding.
  {
    files: TEST_FILES,
    rules: {
      'unicorn/consistent-function-scoping': 'off',
    },
  },
]

export default config
