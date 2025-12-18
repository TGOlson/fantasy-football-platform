import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import 'mantine-datatable/styles.css';
import App from './App.tsx';
import { TRPCProvider } from './lib/trpc-provider';
import { MantineAppProvider } from './lib/mantine-provider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineAppProvider>
      <TRPCProvider>
        <App />
      </TRPCProvider>
    </MantineAppProvider>
  </StrictMode>
);
