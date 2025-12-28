import { type ReactNode } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  AppShell,
  Text,
  Group,
  Stack,
  Avatar,
  ActionIcon,
  NavLink,
  Divider,
  Select,
} from '@mantine/core';
import {
  IconTrophy,
  IconLogout,
  IconLayoutDashboard,
  IconUsers,
  IconChartBar,
  IconCalendar,
  IconUser,
} from '@tabler/icons-react';
import { useAuth } from '@/providers/auth-provider';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { MyLeaguesDocument } from '@/generated/graphql';

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

  // Fetch user's leagues for the selector
  const { data: leaguesData } = useQuery({
    queryKey: ['myLeagues'],
    queryFn: () => graphqlClient.request(MyLeaguesDocument),
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Check if we're in a league context
  const inLeagueContext = !!leagueSlug && !!year;

  // TODO: Find current league from leagues data
  // const currentLeague = leaguesData?.myLeagues.find(
  //   (league) => league.slug === leagueSlug
  // );

  const handleLeagueChange = (slug: string | null) => {
    if (!slug) return;
    const league = leaguesData?.myLeagues.find((l) => l.slug === slug);
    if (league) {
      const currentYear =
        league.currentSeason?.year || new Date().getFullYear();
      navigate(`/${slug}/${currentYear}`);
    }
  };

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

            <Divider />

            <Select
              value={leagueSlug}
              onChange={handleLeagueChange}
              data={
                leaguesData?.myLeagues.map((league) => ({
                  value: league.slug,
                  label: league.name,
                })) || []
              }
              placeholder="Select league"
              styles={{
                input: { fontWeight: 600 },
              }}
            />
            {inLeagueContext && (
              <>
                <NavLink
                  component={Link}
                  to={`/${leagueSlug}/${year}`}
                  label="Standings"
                  leftSection={<IconChartBar size={18} />}
                  active={location.pathname === `/${leagueSlug}/${year}`}
                />

                <NavLink
                  component={Link}
                  to="#"
                  label="My Team"
                  leftSection={<IconUser size={18} />}
                />

                <NavLink
                  component={Link}
                  to="#"
                  label="Matchups"
                  leftSection={<IconCalendar size={18} />}
                />

                <NavLink
                  component={Link}
                  to="#"
                  label="Players"
                  leftSection={<IconUsers size={18} />}
                />
              </>
            )}
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
