import { MantineProvider, createTheme, rem } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

type MantineAppProviderProps = {
  children: ReactNode;
};

const theme = createTheme({
  /** Fantasy platform theme - Linear polish meets sports energy */
  primaryColor: 'violet',
  defaultRadius: 'md',

  // Typography - Plus Jakarta Sans is geometric, modern, with personality
  fontFamily:
    '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", monospace',

  headings: {
    fontFamily:
      '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: rem(28), lineHeight: '1.2' },
      h2: { fontSize: rem(22), lineHeight: '1.3' },
      h3: { fontSize: rem(18), lineHeight: '1.35' },
      h4: { fontSize: rem(15), lineHeight: '1.4' },
    },
  },

  // Custom semantic colors
  colors: {
    // Warm grays for backgrounds
    slate: [
      '#f8f9fa', // 0 - page bg
      '#f1f3f5', // 1 - card bg
      '#e9ecef', // 2 - hover
      '#dee2e6', // 3 - border
      '#ced4da', // 4
      '#adb5bd', // 5
      '#868e96', // 6
      '#495057', // 7
      '#343a40', // 8
      '#212529', // 9
    ],
    // Success/wins - warm gold/amber
    win: [
      '#fffbeb',
      '#fef3c7',
      '#fde68a',
      '#fcd34d',
      '#fbbf24',
      '#f59e0b',
      '#d97706',
      '#b45309',
      '#92400e',
      '#78350f',
    ],
    // Alerts/losses - coral red
    loss: [
      '#fff1f2',
      '#ffe4e6',
      '#fecdd3',
      '#fda4af',
      '#fb7185',
      '#f43f5e',
      '#e11d48',
      '#be123c',
      '#9f1239',
      '#881337',
    ],
    // Positive stats - teal
    positive: [
      '#f0fdfa',
      '#ccfbf1',
      '#99f6e4',
      '#5eead4',
      '#2dd4bf',
      '#14b8a6',
      '#0d9488',
      '#0f766e',
      '#115e59',
      '#134e4a',
    ],
  },

  // Virtual colors for semantic use
  other: {
    // Shadows
    shadowSm:
      '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)',
    shadowMd:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    shadowLg:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    // Semantic tokens
    pageBg: '#f8f9fa',
    cardBg: '#ffffff',
    navBg: '#ffffff',
  },

  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  spacing: {
    xs: rem(8),
    sm: rem(12),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },

  components: {
    Paper: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-white)',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'md',
        shadow: 'sm',
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
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: rem(8),
          fontWeight: 500,
        },
      },
    },
    Table: {
      styles: {
        th: {
          fontWeight: 600,
          fontSize: rem(12),
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--mantine-color-gray-6)',
        },
      },
    },
    Title: {
      styles: {
        root: {
          letterSpacing: '-0.02em',
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
