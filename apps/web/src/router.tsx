import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { LeagueDetailPage } from '@/pages/league-detail';
import { TeamDetailPage } from '@/pages/team-detail';
import { PlayersPage } from '@/pages/players';
import { PlayerDetailPage } from '@/pages/player-detail';
import { LeagueScoringSettingsPage } from '@/pages/league-scoring-settings';
import { ErrorPage } from '@/components/error-page';

// Import loaders from colocated files
import { loader as dashboardLoader } from '@/pages/dashboard/loader';
import { loader as leagueDetailLoader } from '@/pages/league-detail/loader';
import { loader as leagueScoringSettingsLoader } from '@/pages/league-scoring-settings/loader';
import { loader as teamDetailLoader } from '@/pages/team-detail/loader';
import { loader as playersLoader } from '@/pages/players/loader';
import { loader as playerDetailLoader } from '@/pages/player-detail/loader';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  // Protected routes
  // TODO: perhaps wrap auth check for all these routes instead of embedding in the loaders
  {
    path: '/',
    loader: dashboardLoader,
    element: <DashboardPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:leagueSlug/:year',
    loader: leagueDetailLoader,
    element: <LeagueDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:leagueSlug/:year/settings',
    loader: leagueScoringSettingsLoader,
    element: <LeagueScoringSettingsPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:leagueSlug/:year/teams/:teamId',
    loader: teamDetailLoader,
    element: <TeamDetailPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:leagueSlug/:year/players',
    loader: playersLoader,
    element: <PlayersPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/:leagueSlug/:year/players/:playerId',
    loader: playerDetailLoader,
    element: <PlayerDetailPage />,
    errorElement: <ErrorPage />,
  },

  // Catch all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
