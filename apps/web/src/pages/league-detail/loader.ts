import { type LoaderFunctionArgs } from 'react-router-dom';
import { trpcClient } from '@/lib/trpc-client';

export async function loader({ params }: LoaderFunctionArgs) {
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
