import { Outlet } from 'react-router-dom';
import { LeagueProvider } from '@/lib/league-context';

/**
 * Layout wrapper for all league routes.
 * Provides LeagueContext to all child routes.
 */
export function LeagueLayout() {
  return (
    <LeagueProvider>
      <Outlet />
    </LeagueProvider>
  );
}
