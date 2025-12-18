import { describe, it, expect } from 'vitest';
import { TRPCError } from '@trpc/server';
import {
  withTestTransaction,
  createCaller,
  createAuthedCaller,
  createTestUser,
} from '../../test/e2e-helpers';

describe('auth router', () => {
  describe('register', () => {
    it('should register a new user and return token', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        const result = await caller.auth.register({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        });

        expect(result.token).toBeDefined();
        expect(result.user.email).toBe('newuser@example.com');
        expect(result.user.name).toBe('New User');
        expect(result.user.id).toBeDefined();
      }));

    it('should reject duplicate email registration', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        await createTestUser(db, {
          email: 'existing@example.com',
          name: 'Existing User',
          password: 'password123',
        });

        await expect(
          caller.auth.register({
            email: 'existing@example.com',
            password: 'password456',
            name: 'Another User',
          })
        ).rejects.toThrow(TRPCError);
      }));

    it('should reject passwords shorter than 8 characters', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        await expect(
          caller.auth.register({
            email: 'test@example.com',
            password: 'short',
            name: 'Test User',
          })
        ).rejects.toThrow();
      }));
  });

  describe('login', () => {
    it('should login with valid credentials and return token', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        const user = await createTestUser(db, {
          email: 'login@example.com',
          name: 'Login User',
          password: 'password123',
        });

        const result = await caller.auth.login({
          email: 'login@example.com',
          password: 'password123',
        });

        expect(result.token).toBeDefined();
        expect(result.user.email).toBe('login@example.com');
        expect(result.user.id).toBe(user.id);
      }));

    it('should reject invalid email', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        await expect(
          caller.auth.login({
            email: 'nonexistent@example.com',
            password: 'password123',
          })
        ).rejects.toThrow(TRPCError);
      }));

    it('should reject invalid password', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        await createTestUser(db, {
          email: 'wrongpass@example.com',
          name: 'Test User',
          password: 'correctpassword',
        });

        await expect(
          caller.auth.login({
            email: 'wrongpass@example.com',
            password: 'wrongpassword',
          })
        ).rejects.toThrow(TRPCError);
      }));
  });

  describe('me', () => {
    it('should return current user when authenticated', () =>
      withTestTransaction(async (db) => {
        const user = await createTestUser(db, {
          email: 'me@example.com',
          name: 'Me User',
          password: 'password123',
        });

        const caller = createAuthedCaller(db, user);
        const result = await caller.auth.me();

        expect(result.email).toBe('me@example.com');
        expect(result.name).toBe('Me User');
        expect(result.id).toBe(user.id);
      }));

    it('should reject unauthenticated requests', () =>
      withTestTransaction(async (db) => {
        const caller = createCaller(db);

        await expect(caller.auth.me()).rejects.toThrow(TRPCError);
      }));
  });
});
