import { createContext, useContext, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from '../hooks/trpc';
import { useAuth } from './auth-provider';
import { Center, Loader, Text, Stack } from '@mantine/core';
import { requireAuth } from '@/router/auth';

type LeagueContextValue = {
  league: {
    id: string;
    name: string;
    slug: string;
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
  isHistoricalYear: boolean;
  mostRecentLeagueYear: number;
};

const LeagueContext = createContext<LeagueContextValue | null>(null);

type LeagueProviderProps = {
  children: ReactNode;
};

export function LeagueProvider({ children }: LeagueProviderProps) {
  const { user } = useAuth();
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const season = year ? parseInt(year) : undefined;

  // Fetch current league/season data
  const {
    data: leagueData,
    isLoading,
    error,
  } = trpc.leagues.getBySlug.useQuery(
    { slug: leagueSlug!, season: season! },
    { enabled: !!leagueSlug && !!season }
  );

  // Fetch all seasons to determine most recent year
  const { data: leagues } = trpc.leagues.list.useQuery();
  const currentLeagueFromList = leagues?.find((l) => l.slug === leagueSlug);
  const mostRecentLeagueYear =
    currentLeagueFromList?.currentSeason?.year ??
    season ??
    new Date().getFullYear();

  if (!leagueSlug || !season) {
    return (
      <Center h="100vh">
        <Text c="red">Invalid league URL</Text>
      </Center>
    );
  }

  if (isLoading) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Loader color="violet" />
          <Text c="dimmed" size="sm">
            Loading league...
          </Text>
        </Stack>
      </Center>
    );
  }

  if (error || !leagueData) {
    return (
      <Center h="100vh">
        <Text c="red">{error?.message || 'League not found'}</Text>
      </Center>
    );
  }

  // Find user's franchise in this league
  const myFranchise = leagueData.franchises?.find(
    (f) => f.owner?.id === user?.id
  );

  const value: LeagueContextValue = {
    league: {
      id: leagueData.id,
      name: leagueData.name,
      slug: leagueData.slug,
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
    isCommissioner: leagueData.commissioner?.id === user?.id,
    isHistoricalYear: season < mostRecentLeagueYear,
    mostRecentLeagueYear,
  };

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}

export function useLeague(): LeagueContextValue {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not in league context
 * (useful for components that work both inside and outside league context)
 */
export function useLeagueOptional(): LeagueContextValue | null {
  return useContext(LeagueContext);
}
