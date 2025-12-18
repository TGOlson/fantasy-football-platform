import { type ReactNode } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  AppShell,
  NavLink,
  Text,
  Group,
  Stack,
  Divider,
  Avatar,
  UnstyledButton,
  Menu,
  Box,
} from '@mantine/core';
import {
  IconLayoutDashboard,
  IconTrophy,
  IconUsers,
  IconCalendarEvent,
  IconUser,
  IconSettings,
  IconChartBar,
  IconLogout,
  IconChevronDown,
} from '@tabler/icons-react';
import { useAuth } from '@/lib/auth-context';
import { useLeagueOptional } from '@/lib/league-context';
import { trpc } from '@/lib/trpc';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();

  // Get league context (null if not in league route)
  const leagueContext = useLeagueOptional();

  // Fetch leagues for the league selector (still needed for switching leagues)
  const { data: leagues } = trpc.leagues.list.useQuery();

  // Use context for current league info, or find from list
  const currentLeagueName =
    leagueContext?.league.name ||
    leagues?.find((l) => l.slug === leagueSlug)?.name;
  const myTeam = leagueContext?.myFranchise;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a path is active
  const isActive = (path: string) => location.pathname === path;
  const isActivePrefix = (prefix: string) =>
    location.pathname.startsWith(prefix);

  // Build league-specific base path
  const leagueBase = leagueSlug && year ? `/${leagueSlug}/${year}` : null;

  return (
    <AppShell navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="sm">
        {/* Logo / App Name */}
        <AppShell.Section>
          <Group gap="xs" mb="md">
            <IconTrophy size={24} color="var(--mantine-color-violet-6)" />
            <Text size="md" fw={700}>
              Fantasy
            </Text>
          </Group>
        </AppShell.Section>

        {/* League Selector (when leagues exist) */}
        {leagues && leagues.length > 0 && (
          <AppShell.Section mb="sm">
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton
                  p="xs"
                  style={{
                    borderRadius: 'var(--mantine-radius-sm)',
                    border: '1px solid var(--mantine-color-gray-3)',
                    width: '100%',
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={0}>
                      <Text size="xs" c="dimmed">
                        League
                      </Text>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {currentLeagueName || 'Select League'}
                      </Text>
                    </Stack>
                    <IconChevronDown
                      size={16}
                      color="var(--mantine-color-dimmed)"
                    />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
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
          </AppShell.Section>
        )}

        <Divider mb="sm" />

        {/* Main Navigation */}
        <AppShell.Section grow>
          <Stack gap={4}>
            <NavLink
              component={Link}
              to="/"
              label="Dashboard"
              leftSection={<IconLayoutDashboard size={18} />}
              active={isActive('/')}
            />

            {/* League-specific navigation (when in league context) */}
            {leagueBase && (
              <>
                <NavLink
                  component={Link}
                  to={leagueBase}
                  label="League Home"
                  leftSection={<IconTrophy size={18} />}
                  active={isActive(leagueBase)}
                />
                {myTeam ? (
                  <NavLink
                    component={Link}
                    to={`${leagueBase}/franchises/${myTeam.id}`}
                    label="My Team"
                    leftSection={<IconUser size={18} />}
                    active={isActivePrefix(
                      `${leagueBase}/franchises/${myTeam.id}`
                    )}
                  />
                ) : (
                  <NavLink
                    label="My Team"
                    leftSection={<IconUser size={18} />}
                    disabled
                    c="dimmed"
                  />
                )}
                <NavLink
                  component={Link}
                  to={`${leagueBase}/players`}
                  label="Players"
                  leftSection={<IconUsers size={18} />}
                  active={isActivePrefix(`${leagueBase}/players`)}
                />
                {/* TODO: Matchups */}
                <NavLink
                  label="Matchups"
                  leftSection={<IconCalendarEvent size={18} />}
                  disabled
                  c="dimmed"
                />
                {/* TODO: Standings */}
                <NavLink
                  label="Standings"
                  leftSection={<IconChartBar size={18} />}
                  disabled
                  c="dimmed"
                />

                <Divider my="sm" />

                <NavLink
                  component={Link}
                  to={`${leagueBase}/settings`}
                  label="Scoring Settings"
                  leftSection={<IconSettings size={18} />}
                  active={isActive(`${leagueBase}/settings`)}
                />
              </>
            )}
          </Stack>
        </AppShell.Section>

        <Divider mb="sm" />

        {/* User Section */}
        <AppShell.Section>
          <Box p="xs">
            <Group gap="sm" wrap="nowrap">
              <Avatar size="sm" radius="xl" color="violet">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={500} lineClamp={1}>
                  {user?.name}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {user?.email}
                </Text>
              </Stack>
            </Group>
            <UnstyledButton
              onClick={handleLogout}
              mt="sm"
              p="xs"
              style={{
                borderRadius: 'var(--mantine-radius-sm)',
                width: '100%',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  'var(--mantine-color-gray-1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Group gap="xs">
                <IconLogout size={16} color="var(--mantine-color-dimmed)" />
                <Text size="sm" c="dimmed">
                  Logout
                </Text>
              </Group>
            </UnstyledButton>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
