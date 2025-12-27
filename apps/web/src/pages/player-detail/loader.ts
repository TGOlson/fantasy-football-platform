import { type LoaderFunctionArgs } from 'react-router-dom';
import { trpcClient } from '@/lib/trpc-client';

export async function loader({ params }: LoaderFunctionArgs) {
  const season = parseInt(params.year || new Date().getFullYear().toString());

  const [league, player] = await Promise.all([
    trpcClient.leagues.getBySlug.query({
      slug: params.leagueSlug!,
      season,
    }),
    trpcClient.players.getById.query({
      id: params.playerId!,
      season,
    }),
  ]);

  if (!league || !player) {
    throw new Response('Player or league not found', { status: 404 });
  }

  return { league, player };
}
