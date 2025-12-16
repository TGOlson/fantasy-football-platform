import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/lib/trpc';
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Tabs,
  SimpleGrid,
  Center,
  Button,
} from '@mantine/core';

export function LeagueDetailPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const { data: league, isLoading } = trpc.leagues.getById.useQuery(
    { id: leagueId! },
    { enabled: !!leagueId }
  );

  const { data: matchups } = trpc.matchups.getByLeagueWeek.useQuery(
    {
      leagueId: leagueId!,
      weekNumber: 1,
    },
    { enabled: !!leagueId }
  );

  if (isLoading) {
    return (
      <AppLayout>
        <Center py={60}>
          <Text c="dimmed">Loading league...</Text>
        </Center>
      </AppLayout>
    );
  }

  if (!league) {
    return (
      <AppLayout>
        <Center py={60}>
          <Stack align="center">
            <Title order={3}>League not found</Title>
            <Button component={Link} to="/leagues">
              Back to Leagues
            </Button>
          </Stack>
        </Center>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <Title order={1}>{league.name}</Title>
            <Group>
              <Button
                component={Link}
                to={`/leagues/${leagueId}/scoring`}
                variant="light"
                size="sm"
              >
                Scoring Settings
              </Button>
              <Badge size="lg" variant="light" color="violet">
                {league.activeSeason?.status || 'Setup'}
              </Badge>
            </Group>
          </Group>
          <Text c="dimmed">
            {league.activeSeason?.season || 'N/A'} Season • Commissioner:{' '}
            {league.commissioner?.name}
          </Text>
        </div>

        {/* Stats */}
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
              Teams
            </Text>
            <Text size="xl" fw={700}>
              {league.teams?.length || 0} / {league.settings?.teamCount || 10}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
              Playoff Teams
            </Text>
            <Text size="xl" fw={700}>
              {league.settings?.playoffTeams || 4}
            </Text>
          </Paper>

          <Paper withBorder p="md" radius="md">
            <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
              Scoring
            </Text>
            <Text size="sm" fw={500}>
              {league.settings?.scoringRules?.receiving?.receptions?.byPosition?.TE
                ? 'TE Premium'
                : 'Standard PPR'}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs defaultValue="teams">
          <Tabs.List>
            <Tabs.Tab value="teams">Teams</Tabs.Tab>
            <Tabs.Tab value="matchups">Matchups</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="teams" pt="md">
            {league.teams && league.teams.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {league.teams.map((team) => (
                  <Paper
                    key={team.id}
                    component={Link}
                    to={`/teams/${team.id}`}
                    withBorder
                    p="md"
                    radius="md"
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor =
                        'var(--mantine-color-violet-6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '';
                    }}
                  >
                    <Title order={4} size="h5" mb="xs">
                      {team.name}
                    </Title>
                    <Text size="sm" c="dimmed">
                      0-0-0
                    </Text>
                  </Paper>
                ))}
              </SimpleGrid>
            ) : (
              <Paper withBorder p="xl" radius="md">
                <Text c="dimmed" ta="center">
                  No teams yet
                </Text>
              </Paper>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="matchups" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3} size="h4">
                  Week 1
                </Title>
                <Group gap="xs">
                  <Button variant="subtle" size="sm">
                    ← Prev
                  </Button>
                  <Button variant="subtle" size="sm">
                    Next →
                  </Button>
                </Group>
              </Group>

              {matchups && matchups.length > 0 ? (
                <Stack gap="sm">
                  {matchups.map((matchup) => (
                    <Paper key={matchup.id} withBorder p="md" radius="md">
                      <Group justify="space-between" align="center">
                        <Stack gap={4} style={{ flex: 1 }}>
                          <Text fw={500}>{matchup.team1?.name || 'TBD'}</Text>
                          <Text size="sm" c="dimmed">
                            {matchup.team1?.record
                              ? `${matchup.team1.record.wins}-${matchup.team1.record.losses}-${matchup.team1.record.ties}`
                              : '0-0-0'}
                          </Text>
                        </Stack>

                        <Stack gap={0} align="center">
                          <Text size="xl" fw={700}>
                            {matchup.team1Score || '-'}
                          </Text>
                          <Text size="xs" c="dimmed">
                            vs
                          </Text>
                          <Text size="xl" fw={700}>
                            {matchup.team2Score || '-'}
                          </Text>
                        </Stack>

                        <Stack gap={4} style={{ flex: 1 }} align="end">
                          <Text fw={500}>{matchup.team2?.name || 'BYE'}</Text>
                          <Text size="sm" c="dimmed">
                            {matchup.team2?.record
                              ? `${matchup.team2.record.wins}-${matchup.team2.record.losses}-${matchup.team2.record.ties}`
                              : matchup.team2
                              ? '0-0-0'
                              : ''}
                          </Text>
                        </Stack>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Paper withBorder p="xl" radius="md">
                  <Text c="dimmed" ta="center">
                    No matchups scheduled yet
                  </Text>
                </Paper>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Stack gap="md">
              <Paper withBorder p="md" radius="md">
                <Title order={4} size="h5" mb="md">
                  League Settings
                </Title>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text c="dimmed">Team Count</Text>
                    <Text fw={500}>{league.settings?.teamCount || 10}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text c="dimmed">Playoff Teams</Text>
                    <Text fw={500}>{league.settings?.playoffTeams || 4}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text c="dimmed">Playoff Start Week</Text>
                    <Text fw={500}>
                      Week {league.settings?.playoffStartWeek || 15}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text c="dimmed">Trade Deadline</Text>
                    <Text fw={500}>
                      Week {league.settings?.tradeDeadlineWeek || 11}
                    </Text>
                  </Group>
                </Stack>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Title order={4} size="h5" mb="md">
                  Roster Positions
                </Title>
                <SimpleGrid cols={2}>
                  {league.settings?.rosterPositions &&
                    Object.entries(league.settings.rosterPositions).map(
                      ([position, count]) => (
                        <Group key={position} justify="space-between">
                          <Text c="dimmed">{position}</Text>
                          <Text fw={500}>{count}</Text>
                        </Group>
                      )
                    )}
                </SimpleGrid>
              </Paper>

              <Paper withBorder p="md" radius="md">
                <Title order={4} size="h5" mb="md">
                  Scoring Rules
                </Title>
                <Text size="sm" c="dimmed">
                  Scoring configuration is complex and will be displayed in a
                  future update
                </Text>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </AppLayout>
  );
}
