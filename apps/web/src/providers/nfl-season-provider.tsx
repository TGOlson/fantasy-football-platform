import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader, Center } from '@mantine/core';
import { graphqlClient } from '@/lib/graphql-client';
import { NflSeasonDocument } from '@/generated/graphql';

type NFLSeasonContextValue = {
  currentYear: number;
  currentWeek: number;
};

const NFLSeasonContext = createContext<NFLSeasonContextValue | null>(null);

type NFLSeasonProviderProps = {
  children: ReactNode;
};

export function NFLSeasonProvider({ children }: NFLSeasonProviderProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['nflSeason'],
    queryFn: () => graphqlClient.request(NflSeasonDocument),
    staleTime: Infinity, // NFL season data rarely changes
  });

  // Show loader while fetching NFL season data
  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // This should never happen, but handle it gracefully
  if (!data?.nflSeason) {
    throw new Error('Failed to load NFL season data');
  }

  const contextValue: NFLSeasonContextValue = {
    currentYear: data.nflSeason.year,
    currentWeek: data.nflSeason.currentWeek,
  };

  return (
    <NFLSeasonContext.Provider value={contextValue}>
      {children}
    </NFLSeasonContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useNFLSeasonContext() {
  const context = useContext(NFLSeasonContext);
  if (!context) {
    throw new Error('useNFLSeasonContext must be used within NFLSeasonProvider');
  }
  return context;
}
