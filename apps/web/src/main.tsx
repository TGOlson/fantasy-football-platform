import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import App from './App.tsx';
import { TRPCProvider } from './providers/trpc-provider';
import { MantineAppProvider } from './providers/mantine-provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineAppProvider>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </MantineAppProvider>
  </StrictMode>
);
