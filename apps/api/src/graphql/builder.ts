import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import ScopeAuthPlugin from '@pothos/plugin-scope-auth';
import { DateTimeResolver } from 'graphql-scalars';
import { prisma, Prisma } from '@fantasy-platform/database/client';

export type Context = {
  prisma: typeof prisma;
  user: { userId: string; email: string } | null;
};

type AuthScopes = {
  loggedIn: boolean;
  // Will add more scopes: leagueMember, teamOwner, commissioner
};

export const builder = new SchemaBuilder<{
  Context: Context;
  AuthScopes: AuthScopes;
  Scalars: {
    DateTime: {
      Input: Date;
      Output: Date;
    };
  };
}>({
  plugins: [PrismaPlugin, ScopeAuthPlugin],
  prisma: {
    client: prisma,
    dmmf: Prisma.dmmf,
  },
  scopeAuth: {
    authScopes: async (ctx) => ({
      loggedIn: !!ctx.user,
    }),
    unauthorizedError: () => new Error('Not authorized'),
  },
});

// DateTime scalar from graphql-scalars
builder.addScalarType('DateTime', DateTimeResolver, {});

// Base types
builder.queryType({});
// builder.mutationType({}); // Add this back when we have mutations

export { prisma };
