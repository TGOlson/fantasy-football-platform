import { type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell, NavLink, Text, Button, Stack } from '@mantine/core';
import { useAuth } from '@/lib/auth-context';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Text size="xl" fw={700}>Fantasy Platform</Text>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            <NavLink
              component={Link}
              to="/"
              label="Dashboard"
            />
            <NavLink
              component={Link}
              to="/leagues"
              label="Leagues"
            />
            <NavLink
              component={Link}
              to="/players"
              label="Players"
            />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack gap="xs">
            <Text size="sm" fw={500}>{user?.name}</Text>
            <Text size="xs" c="dimmed">{user?.email}</Text>
            <Button
              variant="subtle"
              size="xs"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
