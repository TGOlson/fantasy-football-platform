import { trpcClient } from '@/lib/trpc-client';

/**
 * Loader for app layout routes.
 * Fetches the user's leagues list for the league selector.
 */
export async function appLoader() {
  const leagues = await trpcClient.leagues.list.query();
  return { leagues };
}
