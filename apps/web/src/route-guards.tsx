import { Navigate, Outlet, useLoaderData } from 'react-router-dom';
import { useAuth, AuthProvider } from '@/providers/auth-provider';
import type { loader as rootLoader } from './root-loader';

// Root layout - wraps entire app with auth provider
export function RootLayout() {
  const { user } = useLoaderData() as Awaited<ReturnType<typeof rootLoader>>;
  return (
    <AuthProvider initialUser={user}>
      <Outlet />
    </AuthProvider>
  );
}

// Guest route - redirects to dashboard if user is already authenticated
export function GuestRoute() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Protected route - redirects to login if not authenticated
export function ProtectedRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
