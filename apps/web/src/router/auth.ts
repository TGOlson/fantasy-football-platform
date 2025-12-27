import { redirect } from 'react-router-dom';
import { trpcClient } from '@/lib/trpc-client';

export async function requireAuth() {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    throw redirect('/login');
  }

  try {
    const user = await trpcClient.auth.me.query();
    return user;
  } catch (_error) {
    // Token invalid or expired
    localStorage.removeItem('auth_token');
    throw redirect('/login');
  }
}
