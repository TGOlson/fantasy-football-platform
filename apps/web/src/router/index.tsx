import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLoaderData,
} from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { LeagueDetailPage } from '@/pages/league-detail';
import { TeamDetailPage } from '@/pages/team-detail';
import { PlayersPage } from '@/pages/players';
import { PlayerDetailPage } from '@/pages/player-detail';
import { LeagueScoringSettingsPage } from '@/pages/league-scoring-settings';
import { ErrorPage } from '@/router/ErrorPage';

// Import loaders
import { loader as leagueDetailLoader } from '@/pages/league-detail/loader';
import { loader as leagueScoringSettingsLoader } from '@/pages/league-scoring-settings/loader';
import { loader as teamDetailLoader } from '@/pages/team-detail/loader';
import { loader as playersLoader } from '@/pages/players/loader';
import { loader as playerDetailLoader } from '@/pages/player-detail/loader';
import { loader as rootLoader } from './root-loader';
import { appLoader } from './app-loader';
import { leagueLoader } from './league-loader';

// Import providers and components
import { useAuth } from '@/providers/auth-provider';
import { LeagueProvider } from '@/providers/league-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { AppLayout } from '@/components/layouts/app-layout';

import { LoadingBar } from '@/components/LoadingBar';

// Root layout - wraps entire app with auth provider and loading bar
function RootLayout() {
  const { user } = useLoaderData() as Awaited<ReturnType<typeof rootLoader>>;
  return (
    <AuthProvider initialUser={user}>
      <LoadingBar />
      <Outlet />
    </AuthProvider>
  );
}

// Guest layout - redirects to dashboard if user is already authenticated
function GuestLayout() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Required auth layout - redirects to login if not authenticated
function RequiredAuthLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    loader: rootLoader,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Guest routes (redirect to dashboard if authenticated)
      {
        element: <GuestLayout />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },

      // Protected routes (require authentication)
      {
        element: <RequiredAuthLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            id: 'app',
            loader: appLoader,
            element: (
              <AppLayout>
                <Outlet />
              </AppLayout>
            ),
            children: [
              // Dashboard (no league context)
              {
                path: '/',
                element: <DashboardPage />,
              },

              // League routes (require league context)
              {
                path: '/:leagueSlug/:year',
                loader: leagueLoader,
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
        ],
      },

      // Catch all
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
