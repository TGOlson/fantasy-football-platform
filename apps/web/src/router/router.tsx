import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { LeagueDetailPage } from '@/pages/league-detail';
import { TeamDetailPage } from '@/pages/team-detail';
import { PlayersPage } from '@/pages/players';
import { PlayerDetailPage } from '@/pages/player-detail';
import { LeagueScoringSettingsPage } from '@/pages/league-scoring-settings';
import { ErrorPage } from '@/router/ErrorPage';

// Import loaders from colocated files
import { loader as leagueDetailLoader } from '@/pages/league-detail/loader';
import { loader as leagueScoringSettingsLoader } from '@/pages/league-scoring-settings/loader';
import { loader as teamDetailLoader } from '@/pages/team-detail/loader';
import { loader as playersLoader } from '@/pages/players/loader';
import { loader as playerDetailLoader } from '@/pages/player-detail/loader';
import { LeagueProvider } from '../providers/league-provider';
import { requireAuth } from './auth';

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

  // Protected routes (no league context)
  {
    path: '/',
    loader: async () => {
      await requireAuth();
      return null;
    },
    element: <Outlet />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      // League routes (wrapped in LeagueLayout for context)
      {
        path: '/:leagueSlug/:year',
        element: (
          <LeagueProvider>
            <Outlet />
          </LeagueProvider>
        ),
        errorElement: <ErrorPage />,
        children: [
          {
            index: true,
            loader: leagueDetailLoader,
            element: <LeagueDetailPage />,
          },
          {
            path: 'settings',
            loader: leagueScoringSettingsLoader,
            element: <LeagueScoringSettingsPage />,
          },
          {
            path: 'teams/:teamId',
            loader: teamDetailLoader,
            element: <TeamDetailPage />,
          },
          {
            path: 'players',
            loader: playersLoader,
            element: <PlayersPage />,
          },
          {
            path: 'players/:playerId',
            loader: playerDetailLoader,
            element: <PlayerDetailPage />,
          },
        ],
      },
    ],
  },

  // Catch all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
