import { createContext, useContext, type ReactNode } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { LeagueLoaderData } from '@/router/league-loader';

const LeagueContext = createContext<LeagueLoaderData | null>(null);

type LeagueProviderProps = {
  children: ReactNode;
};

export function LeagueProvider({ children }: LeagueProviderProps) {
  // Get fully processed league data from loader
  const value = useLoaderData() as LeagueLoaderData;

  return (
    <LeagueContext.Provider value={value}>{children}</LeagueContext.Provider>
  );
}

export function useLeague(): LeagueLoaderData {
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
export function useLeagueOptional(): LeagueLoaderData | null {
  return useContext(LeagueContext);
}
