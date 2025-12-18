import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../api/src/trpc/router';

// Vanilla tRPC client for use in loaders (outside React)
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL
        ? `${import.meta.env.VITE_API_URL}/trpc`
        : 'http://localhost:3000/trpc',

      // Add auth header from localStorage
      headers() {
        const token = localStorage.getItem('auth_token');
        return token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {};
      },
    }),
  ],
});
