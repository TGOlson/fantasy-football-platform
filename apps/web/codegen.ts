import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Will point to running API server
  schema: 'http://localhost:3000/graphql',
  // Scan GraphQL operation files
  documents: ['src/graphql/**/*.graphql'],
  generates: {
    // Generate TypeScript types and typed DocumentNodes
    'src/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-operations', 'typed-document-node'],
      config: {
        // Custom scalar mappings
        scalars: {
          DateTime: 'string',
        },
        // Use type-only imports for types-only packages
        useTypeImports: true,
      },
    },
  },
  // Show more helpful error messages
  errorsOnly: false,
};

export default config;
