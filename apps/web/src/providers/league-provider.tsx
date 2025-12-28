import { createContext, useContext, type ReactNode } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Stack, Skeleton, Alert } from '@mantine/core';
import { graphqlClient } from '@/lib/graphql-client';
import { LeaguePageDocument, type LeaguePageQuery } from '@/generated/graphql';
import { useAuth } from './auth-provider';

type LeagueContextValue = {
  league: NonNullable<LeaguePageQuery['league']>;
  season: NonNullable<NonNullable<LeaguePageQuery['league']>['season']>;
  myTeam: NonNullable<
    NonNullable<NonNullable<LeaguePageQuery['league']>['season']>['teams']
  >[0];
};

const LeagueContext = createContext<LeagueContextValue | null>(null);

type LeagueProviderProps = {
  children: ReactNode;
};

export function LeagueProvider({ children }: LeagueProviderProps) {
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['league', leagueSlug, year],
    queryFn: () =>
      graphqlClient.request(LeaguePageDocument, {
        slug: leagueSlug!,
        year: parseInt(year!, 10),
      }),
    enabled: !!leagueSlug && !!year,
  });

  // Loading state - show default skeleton
  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={300} />
        <Skeleton height={400} />
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert color="red" title="Error loading league">
        {error instanceof Error ? error.message : 'Failed to load league'}
      </Alert>
    );
  }

  // No league found - redirect to dashboard
  if (!data?.league) {
    return <Navigate to="/" replace />;
  }

  // No season found for this year
  if (!data.league.season) {
    return (
      <Alert color="yellow" title="Season not found">
        No season found for {data.league.name} in {year}
      </Alert>
    );
  }

  // Find current user's team
  const myTeam = data.league.season.teams.find(
    (team) => team.owner.id === user?.id
  );

  // This shouldn't happen due to auth, but handle it anyway
  if (!myTeam) {
    return (
      <Alert color="red" title="Access denied">
        You don't have a team in this league
      </Alert>
    );
  }

  const contextValue: LeagueContextValue = {
    league: data.league,
    season: data.league.season,
    myTeam,
  };

  return (
    <LeagueContext.Provider value={contextValue}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeagueContext() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error('useLeagueContext must be used within LeagueProvider');
  }
  return context;
}
