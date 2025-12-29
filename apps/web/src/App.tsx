import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { routes } from '@/routes';
import { QueryProvider } from '@/providers/query-provider';
import { MantineAppProvider } from '@/providers/mantine-provider';
import { NFLSeasonProvider } from '@/providers/nfl-season-provider';

export function App() {
  const router = createBrowserRouter(routes);
  return (
    <MantineAppProvider>
      <QueryProvider>
        <NFLSeasonProvider>
          <RouterProvider router={router} />
        </NFLSeasonProvider>
      </QueryProvider>
    </MantineAppProvider>
  );
}
