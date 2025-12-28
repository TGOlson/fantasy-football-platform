import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { ErrorPage } from '@/error-page';
import { RootLayout, GuestRoute, ProtectedRoute } from '@/route-guards';
import { AppLayout } from '@/app-layout';
import { rootLoader } from '@/root-loader';
import { Text } from '@mantine/core';

export const router = createBrowserRouter([
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
                    element: <Text>League page</Text>,
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
