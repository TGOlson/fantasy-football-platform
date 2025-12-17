import { MantineProvider, createTheme, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

type MantineAppProviderProps = {
  children: ReactNode;
};

const theme = createTheme({
  /** Linear-inspired theme */
  primaryColor: 'violet',
  defaultRadius: 'sm',

  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontFamilyMonospace: 'JetBrains Mono, monospace',

  headings: {
    fontWeight: '600',
    sizes: {
      h1: { fontSize: rem(24), lineHeight: '1.3' },
      h2: { fontSize: rem(20), lineHeight: '1.35' },
      h3: { fontSize: rem(16), lineHeight: '1.4' },
      h4: { fontSize: rem(14), lineHeight: '1.4' },
    },
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(20),
    xl: rem(24),
  },

  components: {
    Paper: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Badge: {
      defaultProps: {
        variant: 'light',
        radius: 'sm',
      },
    },
    Button: {
      defaultProps: {
        radius: 'sm',
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: rem(6),
        },
      },
    },
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
