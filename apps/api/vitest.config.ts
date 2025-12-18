import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // By default, run unit tests only (exclude e2e)
    exclude: ['**/*.e2e.test.ts', 'node_modules/**'],
  },
});
