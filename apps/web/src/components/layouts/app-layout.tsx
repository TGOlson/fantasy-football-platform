import { type ReactNode } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
  useParams,
  useRouteLoaderData,
} from 'react-router-dom';
import {
  AppShell,
  Text,
  Group,
  Stack,
  Avatar,
  ActionIcon,
  NavLink,
  Divider,
  Menu,
  Button,
} from '@mantine/core';
import {
  IconTrophy,
  IconLogout,
  IconLayoutDashboard,
  IconUsers,
  IconUser,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { useLeagueOptional } from '@/providers/league-provider';
import { appLoader } from '@/router/app-loader';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { leagueSlug, year } = useParams();
  const leagueContext = useLeagueOptional();

  // Get leagues from the app route loader
  const { leagues } = useRouteLoaderData('app') as Awaited<
    ReturnType<typeof appLoader>
  >;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) =>
    location.pathname.startsWith(prefix);

  const leagueBase = leagueSlug && year ? `/${leagueSlug}/${year}` : null;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: 'sm' }}
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

            {leagueBase && (
              <>
                <Divider my="sm" />
                <NavLink
                  component={Link}
                  to={leagueBase}
                  label="League Home"
                  leftSection={<IconTrophy size={18} />}
                  active={isActive(leagueBase)}
                />

                {leagueContext?.myFranchise ? (
                  <NavLink
                    component={Link}
                    to={`${leagueBase}/teams/${leagueContext.myFranchise.teamId}`}
                    label="My Team"
                    leftSection={<IconUser size={18} />}
                    active={isActivePrefix(
                      `${leagueBase}/teams/${leagueContext.myFranchise.teamId}`
                    )}
                  />
                ) : (
                  <NavLink
                    label="My Team"
                    leftSection={<IconUser size={18} />}
                    disabled
                  />
                )}

                <NavLink
                  component={Link}
                  to={`${leagueBase}/players`}
                  label="Players"
                  leftSection={<IconUsers size={18} />}
                  active={isActivePrefix(`${leagueBase}/players`)}
                />

                <NavLink
                  component={Link}
                  to={`${leagueBase}/settings`}
                  label="Settings"
                  leftSection={<IconSettings size={18} />}
                  active={isActive(`${leagueBase}/settings`)}
                />
              </>
            )}
          </Stack>
        </AppShell.Section>

        <AppShell.Section>
          <Stack gap="xs">
            <Divider />
            <Menu>
              <Menu.Target>
                <Button
                  variant="light"
                  fullWidth
                  rightSection={<IconChevronDown size={16} />}
                >
                  {leagueContext?.league.name || 'Select League'}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Your Leagues</Menu.Label>
                {leagues.map((league) => (
                  <Menu.Item
                    key={league.id}
                    onClick={() =>
                      navigate(
                        `/${league.slug}/${league.currentSeason?.year || new Date().getFullYear()}`
                      )
                    }
                  >
                    {league.name}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>

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
