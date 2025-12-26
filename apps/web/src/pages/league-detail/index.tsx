import { useState } from 'react';
import { useLoaderData, useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/providers/league-provider';
import { trpc } from '@/hooks/trpc';
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Tabs,
  SimpleGrid,
  Button,
  Table,
  Select,
} from '@mantine/core';
import { loader } from './loader';
import { PageHeader, StatCard, HistoricalBanner } from '@/components/ui';

export function LeagueDetailPage() {
  const { league } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { leagueSeason, isHistoricalYear, mostRecentLeagueYear } = useLeague();

  // Week navigation state
  const regularSeasonWeeks = (league.settings?.playoffStartWeek || 15) - 1;
  const [currentWeek, setCurrentWeek] = useState(1);

  const { data: matchups } = trpc.matchups.getByLeagueWeek.useQuery({
    leagueId: league.leagueId,
    weekNumber: currentWeek,
    season: parseInt(year || '2024'),
  });

  const { data: standings } = trpc.standings.getByLeagueSeason.useQuery(
    { leagueSeasonId: leagueSeason?.id || '' },
    { enabled: !!leagueSeason?.id }
  );

  // Build subtitle - only show year if historical
  const subtitleParts = [];
  if (isHistoricalYear && leagueSeason) {
    subtitleParts.push(`${leagueSeason.year} Season`);
  }
  subtitleParts.push(`Commissioner: ${league.commissioner?.name}`);

  return (
    <AppLayout>
      <Stack gap="lg">
        {isHistoricalYear && leagueSeason && (
          <HistoricalBanner
            year={leagueSeason.year}
            currentYearPath={`/${leagueSlug}/${mostRecentLeagueYear}`}
          />
        )}

        {/* Header */}
        <PageHeader
          title={league.name}
          subtitle={subtitleParts.join(' • ')}
          actions={
            <Button
              component={Link}
              to={`/${leagueSlug}/${year}/settings`}
              variant="light"
              size="sm"
            >
              Scoring Settings
            </Button>
          }
          badges={
            <Badge size="lg" variant="light" color="violet">
              {league.activeSeason?.status || 'Setup'}
            </Badge>
          }
        />

        {/* Stats */}
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <StatCard label="Franchises" value={league.franchises?.length || 0} />
          <StatCard
            label="Playoff Teams"
            value={league.settings?.playoffTeams || 4}
          />
          <StatCard
            label="Scoring"
            value="Custom"
            info="View scoring settings for details"
          />
        </SimpleGrid>

        {/* Tabs */}
        <Tabs defaultValue="standings">
          <Tabs.List>
            <Tabs.Tab value="standings">Standings</Tabs.Tab>
            <Tabs.Tab value="matchups">Matchups</Tabs.Tab>
            <Tabs.Tab value="franchises">Franchises</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="standings" pt="md">
            {standings && standings.length > 0 ? (
              <Paper withBorder radius="md">
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th w={40}>#</Table.Th>
                      <Table.Th>Franchise</Table.Th>
                      <Table.Th ta="center">W</Table.Th>
                      <Table.Th ta="center">L</Table.Th>
                      <Table.Th ta="center">T</Table.Th>
                      <Table.Th ta="right">PF</Table.Th>
                      <Table.Th ta="right">PA</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {standings.map((franchise, index) => {
                      const isPlayoffTeam =
                        index < (league.settings?.playoffTeams || 4);
                      return (
                        <Table.Tr
                          key={franchise.teamId}
                          component={Link}
                          // @ts-expect-error deal with this later
                          to={`/${leagueSlug}/${year}/teams/${franchise.teamId}`}
                          style={{ textDecoration: 'none', cursor: 'pointer' }}
                        >
                          <Table.Td>
                            <Text
                              fw={500}
                              c={isPlayoffTeam ? 'green' : undefined}
                            >
                              {index + 1}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Stack gap={0}>
                              <Text fw={500}>{franchise.franchiseName}</Text>
                              <Text size="xs" c="dimmed">
                                {franchise.ownerName}
                              </Text>
                            </Stack>
                          </Table.Td>
                          <Table.Td ta="center">
                            <Text fw={500} c="green">
                              {franchise.wins}
                            </Text>
                          </Table.Td>
                          <Table.Td ta="center">
                            <Text c="red">{franchise.losses}</Text>
                          </Table.Td>
                          <Table.Td ta="center">
                            <Text c="dimmed">{franchise.ties}</Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text>{franchise.pointsFor.toFixed(1)}</Text>
                          </Table.Td>
                          <Table.Td ta="right">
                            <Text c="dimmed">
                              {franchise.pointsAgainst.toFixed(1)}
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
                <Group justify="flex-start" p="sm" pt={0}>
                  <Text size="xs" c="dimmed">
                    Top {league.settings?.playoffTeams || 4} teams make playoffs
                  </Text>
                </Group>
              </Paper>
            ) : (
              <Paper withBorder p="xl" radius="md">
                <Text c="dimmed" ta="center">
                  No standings data yet
                </Text>
              </Paper>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="franchises" pt="md">
            {league.franchises && league.franchises.length > 0 ? (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                {league.franchises.map((franchise) => {
                  // Find franchise's standing
                  const franchiseStanding = standings?.find(
                    (s) => s.franchiseId === franchise.id
                  );
                  const record = franchiseStanding
                    ? `${franchiseStanding.wins}-${franchiseStanding.losses}-${franchiseStanding.ties}`
                    : '0-0-0';

                  const teamId = franchise.team?.id;

                  return (
                    <Paper
                      key={franchise.id}
                      component={teamId ? Link : 'div'}
                      to={teamId ? `/${leagueSlug}/${year}/teams/${teamId}` : undefined}
                      withBorder
                      p="md"
                      radius="md"
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        cursor: teamId ? 'pointer' : 'default',
                        transition: 'border-color 0.2s',
                        opacity: teamId ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (teamId) {
                          e.currentTarget.style.borderColor =
                            'var(--mantine-color-violet-6)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '';
                      }}
                    >
                      <Title order={4} size="h5" mb="xs">
                        {franchise.name}
                      </Title>
                      <Text size="sm" c="dimmed">
                        {franchise.owner?.name || 'No owner'} • {record}
                      </Text>
                    </Paper>
                  );
                })}
              </SimpleGrid>
            ) : (
              <Paper withBorder p="xl" radius="md">
                <Text c="dimmed" ta="center">
                  No franchises yet
                </Text>
              </Paper>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="matchups" pt="md">
            <Stack gap="md">
              <Group justify="space-between">
                <Group gap="sm">
                  <Title order={3} size="h4">
                    Week {currentWeek}
                  </Title>
                  <Select
                    size="xs"
                    w={100}
                    value={currentWeek.toString()}
                    onChange={(val) => setCurrentWeek(parseInt(val || '1'))}
                    data={Array.from(
                      { length: regularSeasonWeeks },
                      (_, i) => ({
                        value: (i + 1).toString(),
                        label: `Week ${i + 1}`,
                      })
                    )}
                  />
                </Group>
                <Group gap="xs">
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={currentWeek <= 1}
                    onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                  >
                    ← Prev
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    disabled={currentWeek >= regularSeasonWeeks}
                    onClick={() =>
                      setCurrentWeek((w) => Math.min(regularSeasonWeeks, w + 1))
                    }
                  >
                    Next →
                  </Button>
                </Group>
              </Group>

              {matchups && matchups.length > 0 ? (
                <Stack gap="sm">
                  {matchups.map((matchup) => {
                    const homeScore = matchup.homeScore
                      ? parseFloat(matchup.homeScore)
                      : null;
                    const awayScore = matchup.awayScore
                      ? parseFloat(matchup.awayScore)
                      : null;
                    const homeWon =
                      homeScore !== null &&
                      awayScore !== null &&
                      homeScore > awayScore;
                    const awayWon =
                      homeScore !== null &&
                      awayScore !== null &&
                      awayScore > homeScore;

                    return (
                      <Paper key={matchup.id} withBorder p="md" radius="md">
                        <Group justify="space-between" align="center">
                          <Stack gap={4} style={{ flex: 1 }}>
                            <Text
                              fw={homeWon ? 700 : 500}
                              c={homeWon ? 'green' : undefined}
                            >
                              {matchup.home?.name || 'TBD'}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {matchup.home?.record
                                ? `${matchup.home.record.wins}-${matchup.home.record.losses}-${matchup.home.record.ties}`
                                : '0-0-0'}
                            </Text>
                          </Stack>

                          <Stack gap={0} align="center" miw={80}>
                            <Text
                              size="xl"
                              fw={700}
                              c={homeWon ? 'green' : undefined}
                            >
                              {homeScore?.toFixed(1) ?? '-'}
                            </Text>
                            <Text size="xs" c="dimmed">
                              vs
                            </Text>
                            <Text
                              size="xl"
                              fw={700}
                              c={awayWon ? 'green' : undefined}
                            >
                              {awayScore?.toFixed(1) ?? '-'}
                            </Text>
                          </Stack>

                          <Stack gap={4} style={{ flex: 1 }} align="end">
                            <Text
                              fw={awayWon ? 700 : 500}
                              c={awayWon ? 'green' : undefined}
                            >
                              {matchup.away?.name || 'BYE'}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {matchup.away?.record
                                ? `${matchup.away.record.wins}-${matchup.away.record.losses}-${matchup.away.record.ties}`
                                : matchup.away
                                  ? '0-0-0'
                                  : ''}
                            </Text>
                          </Stack>
                        </Group>
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Paper withBorder p="xl" radius="md">
                  <Text c="dimmed" ta="center">
                    No matchups scheduled for this week
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
                    <Text c="dimmed">Franchise Count</Text>
                    <Text fw={500}>{league.franchises?.length || 0}</Text>
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
                  {league.settings.rosterSlots.map((slot, index) => (
                    <Group key={index} justify="space-between">
                      {/* TODO: better grouping and rendering */}
                      <Text c="dimmed">{JSON.stringify(slot)}</Text>
                    </Group>
                  ))}
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
