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
  Paper,
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
  IconSelector,
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
    <AppShell
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="lg"
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-slate-0)',
          minHeight: '100vh',
        },
        navbar: {
          backgroundColor: 'var(--mantine-color-white)',
          borderRight: '1px solid var(--mantine-color-gray-2)',
        },
      }}
    >
      <AppShell.Navbar p="md">
        {/* Logo / App Name */}
        <AppShell.Section>
          <Group gap="xs" mb="lg">
            <Box
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconTrophy size={18} color="white" />
            </Box>
            <Text size="lg" fw={800} style={{ letterSpacing: '-0.02em' }}>
              Fantasy
            </Text>
          </Group>
        </AppShell.Section>

        {/* League Selector (when leagues exist) */}
        {leagues && leagues.length > 0 && (
          <AppShell.Section mb="md">
            <Menu shadow="md" width={220}>
              <Menu.Target>
                <UnstyledButton
                  p="sm"
                  style={{
                    borderRadius: 'var(--mantine-radius-md)',
                    border: '1px solid var(--mantine-color-gray-3)',
                    backgroundColor: 'var(--mantine-color-slate-0)',
                    width: '100%',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--mantine-color-violet-4)';
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-violet-0)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--mantine-color-gray-3)';
                    e.currentTarget.style.backgroundColor = 'var(--mantine-color-slate-0)';
                  }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Stack gap={2}>
                      <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                        League
                      </Text>
                      <Text size="sm" fw={600} lineClamp={1}>
                        {currentLeagueName || 'Select League'}
                      </Text>
                    </Stack>
                    <IconSelector
                      size={16}
                      color="var(--mantine-color-gray-5)"
                    />
                  </Group>
                </UnstyledButton>
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
                    fw={league.slug === leagueSlug ? 600 : 400}
                    bg={league.slug === leagueSlug ? 'violet.0' : undefined}
                  >
                    {league.name}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          </AppShell.Section>
        )}

        <Divider mb="md" color="gray.2" />

        {/* Main Navigation */}
        <AppShell.Section grow>
          <Stack gap={4}>
            <NavLink
              component={Link}
              to="/"
              label="Dashboard"
              leftSection={<IconLayoutDashboard size={18} />}
              active={isActive('/')}
              variant="filled"
            />

            {/* League-specific navigation (when in league context) */}
            {leagueBase && (
              <>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mt="md" mb={4} style={{ letterSpacing: '0.5px' }}>
                  League
                </Text>
                <NavLink
                  component={Link}
                  to={leagueBase}
                  label="League Home"
                  leftSection={<IconTrophy size={18} />}
                  active={isActive(leagueBase)}
                  variant="filled"
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
                    variant="filled"
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
                  variant="filled"
                />
                <NavLink
                  label="Matchups"
                  leftSection={<IconCalendarEvent size={18} />}
                  disabled
                  c="dimmed"
                />
                <NavLink
                  label="Standings"
                  leftSection={<IconChartBar size={18} />}
                  disabled
                  c="dimmed"
                />

                <Text size="xs" c="dimmed" fw={600} tt="uppercase" mt="md" mb={4} style={{ letterSpacing: '0.5px' }}>
                  Settings
                </Text>
                <NavLink
                  component={Link}
                  to={`${leagueBase}/settings`}
                  label="Scoring Rules"
                  leftSection={<IconSettings size={18} />}
                  active={isActive(`${leagueBase}/settings`)}
                  variant="filled"
                />
              </>
            )}
          </Stack>
        </AppShell.Section>

        <Divider mb="md" color="gray.2" />

        {/* User Section */}
        <AppShell.Section>
          <Paper p="sm" bg="slate.0" radius="md">
            <Group gap="sm" wrap="nowrap">
              <Avatar size="md" radius="xl" color="violet" variant="filled">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Stack gap={0} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" fw={600} lineClamp={1}>
                  {user?.name}
                </Text>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  {user?.email}
                </Text>
              </Stack>
            </Group>
          </Paper>
          <UnstyledButton
            onClick={handleLogout}
            mt="sm"
            p="sm"
            style={{
              borderRadius: 'var(--mantine-radius-md)',
              width: '100%',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                'var(--mantine-color-loss-0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Group gap="xs">
              <IconLogout size={16} color="var(--mantine-color-gray-6)" />
              <Text size="sm" c="dimmed" fw={500}>
                Sign out
              </Text>
            </Group>
          </UnstyledButton>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
