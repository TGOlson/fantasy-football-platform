import { trpcClient } from '@/lib/trpc-client';

/**
 * Root loader - checks authentication state on app load.
 * This runs once when the app starts, providing initial user state.
 */
export async function loader(): Promise<{
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}> {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return { user: null };
  }

  try {
    const user = await trpcClient.auth.me.query();
    return { user };
  } catch (_error) {
    // Token invalid or expired
    localStorage.removeItem('auth_token');
    return { user: null };
  }
}
