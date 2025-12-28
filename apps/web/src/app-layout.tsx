import { type ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Text,
  Group,
  Stack,
  Avatar,
  ActionIcon,
  NavLink,
  Divider,
} from '@mantine/core';
import {
  IconTrophy,
  IconLogout,
  IconLayoutDashboard,
} from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'xs' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <IconTrophy size={24} />
          <Text size="lg" fw={700}>
            Fantasy
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            <NavLink
              component={Link}
              to="/"
              label="Dashboard"
              leftSection={<IconLayoutDashboard size={18} />}
              active={isActive('/')}
            />
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack gap="xs">
            <Divider />

            <Group gap="xs">
              <Avatar size="sm" color="violet">
                {user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Stack gap={0} style={{ flex: 1 }}>
                <Text size="sm" fw={500} lineClamp={1}>
                  {user?.name}
                </Text>
              </Stack>
              <ActionIcon variant="subtle" onClick={handleLogout}>
                <IconLogout size={18} />
              </ActionIcon>
            </Group>
          </Stack>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
