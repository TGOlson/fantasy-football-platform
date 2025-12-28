import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Will point to running API server
  schema: 'http://localhost:3000/graphql',
  // Scan all TypeScript/TSX files in web app for GraphQL queries
  documents: ['apps/web/src/**/*.{ts,tsx}'],
  generates: {
    // Output directory for generated types and hooks
    'apps/web/src/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        // Custom scalar mappings
        scalars: {
          DateTime: 'string',
        },
      },
    },
  },
  // Show more helpful error messages
  errorsOnly: false,
};

export default config;
