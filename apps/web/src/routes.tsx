import { Navigate, Outlet, type RouteObject } from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { LeaguePage } from '@/pages/league';
import { TeamPage } from '@/pages/team';
import { TeamRedirect } from '@/pages/team-redirect';
import { ErrorPage } from '@/error-page';
import { RootLayout, GuestRoute, ProtectedRoute } from '@/route-guards';
import { AppLayout } from '@/app-layout';
import { rootLoader } from '@/root-loader';
import { LeagueProvider } from '@/providers/league-provider';

export const routes: RouteObject[] = [
  {
    loader: rootLoader,
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      // Guest routes (redirect to dashboard if authenticated)
      {
        element: <GuestRoute />,
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
        element: <ProtectedRoute />,
        children: [
          {
            element: (
              <AppLayout>
                <Outlet />
              </AppLayout>
            ),
            children: [
              // Error boundary for app routes (keeps AppLayout visible)
              {
                errorElement: <ErrorPage />,
                children: [
                  // Dashboard (no league context)
                  {
                    path: '/',
                    element: <DashboardPage />,
                  },

                  // League routes (require league context)
                  {
                    path: '/:leagueSlug/:year',
                    element: (
                      <LeagueProvider>
                        <Outlet />
                      </LeagueProvider>
                    ),
                    children: [
                      {
                        index: true,
                        element: <LeaguePage />,
                      },
                      {
                        path: 'teams/:teamId',
                        element: <TeamRedirect />,
                      },
                      {
                        path: 'teams/:teamId/w/:weekNumber',
                        element: <TeamPage />,
                      },
                    ],
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
];
