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
    localStorage.removeItem('auth_token');
    throw redirect('/login');
  }
}

export async function loader({ params }: LoaderFunctionArgs) {
  await requireAuth();

  const teamId = params.teamId!;
  const season = parseInt(params.year || new Date().getFullYear().toString());

  // Fetch all data in parallel using simple routers
  const [team, franchise, leagueSeason] = await Promise.all([
    trpcClient.teams.getById.query({ teamId }),
    trpcClient.teams.getFranchise.query({ teamId }),
    trpcClient.teams.getLeagueSeason.query({ teamId }),
  ]);

  // Fetch league and standings
  const [league, standings] = await Promise.all([
    trpcClient.leagues.getBySlug.query({
      slug: params.leagueSlug!,
      season,
    }),
    trpcClient.standings.getByLeagueSeason.query({
      leagueSeasonId: leagueSeason.id,
    }),
  ]);

  if (!team || !franchise || !league) {
    throw new Response('Team not found', { status: 404 });
  }

  return {
    team,
    franchise,
    leagueSeason,
    settings: league.settings,
    standings,
  };
}
