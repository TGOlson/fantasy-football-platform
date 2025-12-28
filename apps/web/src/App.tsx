import { RouterProvider } from 'react-router-dom';
import { router } from '@/router';
import { QueryProvider } from '@/providers/query-provider';
import { MantineAppProvider } from '@/providers/mantine-provider';

export function App() {
  return (
    <MantineAppProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </MantineAppProvider>
  );
}
