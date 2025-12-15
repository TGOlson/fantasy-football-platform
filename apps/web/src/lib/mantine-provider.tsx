import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

type MantineAppProviderProps = {
  children: ReactNode;
};

const theme = createTheme({
  /** Linear-inspired theme */
  primaryColor: 'violet',
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  headings: {
    fontWeight: '600',
  },
});

export function MantineAppProvider({ children }: MantineAppProviderProps) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" />
      {children}
    </MantineProvider>
  );
}
