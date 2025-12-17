import { createContext, useContext, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { trpc } from './trpc';
import { useAuth } from './auth-context';
import { Center, Loader, Text, Stack } from '@mantine/core';

type LeagueContextValue = {
  league: {
    id: string;
    name: string;
    slug: string;
  };
  leagueSeason: {
    id: string;
    season: number;
    status: string;
  };
  myTeam: {
    id: string;
    name: string;
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
  const { leagueSlug, year } = useParams<{ leagueSlug: string; year: string }>();
  const season = year ? parseInt(year) : undefined;

  // Fetch current league/season data
  const { data: leagueData, isLoading, error } = trpc.leagues.getBySlug.useQuery(
    { slug: leagueSlug!, season: season! },
    { enabled: !!leagueSlug && !!season }
  );

  // Fetch all seasons to determine most recent year
  const { data: leagues } = trpc.leagues.list.useQuery();
  const currentLeagueFromList = leagues?.find((l) => l.slug === leagueSlug);
  const mostRecentLeagueYear = currentLeagueFromList?.currentSeason?.season ?? season ?? new Date().getFullYear();

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
          <Text c="dimmed" size="sm">Loading league...</Text>
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

  // Find user's team in this league
  const myTeam = leagueData.teams?.find((t) => t.ownerId === user?.id);

  const value: LeagueContextValue = {
    league: {
      id: leagueData.id,
      name: leagueData.name,
      slug: leagueData.slug,
    },
    leagueSeason: {
      id: leagueData.activeSeason!.id,
      season: leagueData.activeSeason!.season,
      status: leagueData.activeSeason!.status,
    },
    myTeam: myTeam ? { id: myTeam.id, name: myTeam.name } : null,
    isCommissioner: leagueData.commissionerId === user?.id,
    isHistoricalYear: season < mostRecentLeagueYear,
    mostRecentLeagueYear,
  };

  return (
    <LeagueContext.Provider value={value}>
      {children}
    </LeagueContext.Provider>
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
