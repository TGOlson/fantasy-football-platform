import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLoaderData,
} from 'react-router-dom';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { DashboardPage } from '@/pages/dashboard';
import { ErrorPage } from '@/router/ErrorPage';

import { loader as rootLoader } from './root-loader';
import { appLoader } from './app-loader';

// Import providers and components
import { useAuth } from '@/providers/auth-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { AppLayout } from '@/components/layouts/app-layout';

import { Text } from '@mantine/core';

// Root layout - wraps entire app with auth provider and loading bar
function RootLayout() {
  const { user } = useLoaderData() as Awaited<ReturnType<typeof rootLoader>>;
  return (
    <AuthProvider initialUser={user}>
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
                // loader: leagueLoader,
                element: <Text>League page</Text>,
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
