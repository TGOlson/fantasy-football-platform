import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Only run e2e tests
    include: ['**/*.e2e.test.ts'],
    // Setup file for environment variables
    setupFiles: ['./src/test/e2e-setup.ts'],
    // Run tests sequentially to avoid transaction conflicts
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Longer timeout for database operations
    testTimeout: 10000,
  },
});
