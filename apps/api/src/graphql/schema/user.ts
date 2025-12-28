import { builder } from '../builder';
import { hashPassword, comparePassword, signToken } from '../../lib/auth';

// User GraphQL type
const UserObject = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    isSiteAdmin: t.exposeBoolean('isSiteAdmin'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
  }),
});

// AuthPayload type - returned after login/register
const AuthPayload = builder.objectRef<{
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    isSiteAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}>('AuthPayload');

AuthPayload.implement({
  fields: (t) => ({
    token: t.exposeString('token'),
    user: t.field({
      type: UserObject,
      resolve: (parent) => parent.user,
    }),
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

      return ctx.prisma.user.findUniqueOrThrow({
        ...query,
        where: { id: ctx.user.userId },
      });
    },
  })
);

// Login mutation
builder.mutationField('login', (t) =>
  t.field({
    type: AuthPayload,
    args: {
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValid = await comparePassword(args.password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
      });

      return { token, user };
    },
  })
);

// Register mutation
builder.mutationField('register', (t) =>
  t.field({
    type: AuthPayload,
    args: {
      name: t.arg.string({ required: true }),
      email: t.arg.string({ required: true }),
      password: t.arg.string({ required: true }),
    },
    resolve: async (root, args, ctx) => {
      const existingUser = await ctx.prisma.user.findUnique({
        where: { email: args.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await hashPassword(args.password);

      const user = await ctx.prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          passwordHash,
        },
      });

      const token = signToken({
        userId: user.id,
        email: user.email,
      });

      return { token, user };
    },
  })
);
