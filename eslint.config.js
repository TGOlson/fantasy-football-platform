import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist', '**/node_modules']),

  // Shared TypeScript config for all apps
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
  },

  // Shared rule overrides (applied after extends)
  {
    files: ['apps/**/*.{ts,tsx}', 'packages/**/*.ts'],
    rules: {
      // Allow unused vars prefixed with underscore
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  // Web app - React specific
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    extends: [reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname + '/apps/web',
      },
    },
  },

  // API app - Node specific
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname + '/apps/api',
      },
    },
    rules: {
      // Restrict getDatabase import to enforce ctx.db usage for testability
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@fantasy-platform/database/client',
              importNames: ['getDatabase'],
              message:
                'Use ctx.db instead of getDatabase() for testability. Only context.ts and test helpers should import getDatabase.',
            },
          ],
        },
      ],
    },
  },

  // API exceptions - allow getDatabase in specific files
  {
    files: ['apps/api/src/trpc/context.ts', 'apps/api/src/test/**/*.ts'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);
