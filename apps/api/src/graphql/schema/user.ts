import { builder } from '../builder';

// User GraphQL type
builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    isSiteAdmin: t.exposeBoolean('isSiteAdmin'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

// Query to get current user
builder.queryField('me', (t) =>
  t.prismaField({
    type: 'User',
    authScopes: { loggedIn: true },
    resolve: async (query, root, args, ctx) => {
      if (!ctx.user) {
        throw new Error('Not authenticated');
      }

      const user = await ctx.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: ctx.user.userId },
      });

      return user;
    },
  })
);
