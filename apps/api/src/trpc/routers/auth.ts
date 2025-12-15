import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../trpc.js';
import { getDatabase, users, eq } from '@fantasy-platform/database';
import { hashPassword, comparePassword, signToken } from '../../lib/auth.js';

export const authRouter = router({
  // Register a new user
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        name: z.string().min(1, 'Name is required'),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(input.password);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          name: input.name,
        })
        .returning();

      // Generate JWT token
      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
      });

      return {
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      };
    }),

  // Login with email and password
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDatabase();

      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (!user) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Verify password
      const isValidPassword = await comparePassword(
        input.password,
        user.passwordHash
      );

      if (!isValidPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password',
        });
      }

      // Generate JWT token
      const token = signToken({
        userId: user.id,
        email: user.email,
      });

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    }),

  // Get current user (protected - requires JWT)
  me: protectedProcedure.query(async ({ ctx }) => {
    const db = getDatabase();

    // ctx.user is guaranteed to exist because of protectedProcedure
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.userId))
      .limit(1);

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }),
});
