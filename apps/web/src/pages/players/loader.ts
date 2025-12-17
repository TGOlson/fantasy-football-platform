import { redirect, type LoaderFunctionArgs } from 'react-router-dom';
import { trpcClient } from '@/lib/trpc-client';

async function requireAuth() {
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

export async function loader({ params }: LoaderFunctionArgs) {
  await requireAuth();

  const season = parseInt(params.year || new Date().getFullYear().toString());
  const league = await trpcClient.leagues.getBySlug.query({
    slug: params.leagueSlug!,
    season,
  });

  if (!league) {
    throw new Response('League not found', { status: 404 });
  }

  return { league };
}
