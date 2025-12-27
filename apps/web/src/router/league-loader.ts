import { type LoaderFunctionArgs } from 'react-router-dom';
import { trpcClient } from '@/lib/trpc-client';

export type LeagueLoaderData = {
  league: {
    id: string;
    name: string;
    slug: string;
    settings?: {
      playoffTeams?: number;
    } | null;
  };
  leagueSeason: {
    id: string;
    year: number;
    status: string;
  };
  myFranchise: {
    id: string;
    name: string;
    teamId: string;
  } | null;
  isCommissioner: boolean;
};

/**
 * Loader for league routes.
 * Fetches and processes all data needed by LeagueProvider.
 */
export async function leagueLoader({ params }: LoaderFunctionArgs) {
  const { leagueSlug, year } = params;

  if (!leagueSlug || !year) {
    throw new Response('Invalid league URL', { status: 400 });
  }

  const season = parseInt(year);

  // Fetch league data
  const leagueData = await trpcClient.leagues.getBySlug.query({
    slug: leagueSlug,
    season,
  });

  // API enforces membership - if we got data, user is a member
  if (!leagueData) {
    throw new Response('League not found', { status: 404 });
  }

  // Get current user from the auth token (API already validated this)
  const user = await trpcClient.auth.me.query();

  // Find user's franchise in this league
  const myFranchise = leagueData.franchises?.find(
    (f) => f.owner?.id === user.id
  );

  // Return processed data in the shape LeagueProvider needs
  const leagueContextValue: LeagueLoaderData = {
    league: {
      id: leagueData.id,
      name: leagueData.name,
      slug: leagueData.slug,
      settings: leagueData.settings
        ? {
            playoffTeams: leagueData.settings.playoffTeams,
          }
        : null,
    },
    leagueSeason: {
      id: leagueData.activeSeason!.id,
      year: leagueData.activeSeason!.year,
      status: leagueData.activeSeason!.status,
    },
    myFranchise:
      myFranchise && myFranchise.team
        ? {
            id: myFranchise.id,
            name: myFranchise.name,
            teamId: myFranchise.team.id,
          }
        : null,
    isCommissioner: leagueData.commissioner?.id === user.id,
  };

  return leagueContextValue;
}
