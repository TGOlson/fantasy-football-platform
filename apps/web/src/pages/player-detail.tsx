import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/lib/trpc';
import { CURRENT_SEASON } from '@fantasy-platform/types';
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Center,
  Button,
  SimpleGrid,
  Modal,
  Alert,
  Select,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { ScoreBreakdown } from '@/components/score-breakdown';

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [selectedLeagueSeasonId, setSelectedLeagueSeasonId] = useState<string | null>(null);

  const { data: player, isLoading: playerLoading } = trpc.players.getById.useQuery(
    { id: playerId!, season: CURRENT_SEASON },
    { enabled: !!playerId }
  );

  const { data: stats, isLoading: statsLoading } = trpc.players.getStats.useQuery(
    { id: playerId!, season: CURRENT_SEASON },
    { enabled: !!playerId }
  );

  // Get user's leagues to select scoring rules
  const { data: leagues } = trpc.leagues.list.useQuery();

  // Get score breakdown for selected week
  const { data: scoreData, isLoading: scoreLoading } = trpc.scoring.calculatePlayerScore.useQuery(
    {
      playerId: playerId!,
      season: CURRENT_SEASON,
      weekNumber: selectedWeek!,
      leagueSeasonId: selectedLeagueSeasonId!,
    },
    {
      enabled: !!playerId && !!selectedWeek && !!selectedLeagueSeasonId,
    }
  );

  const isLoading = playerLoading || statsLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <Center py={60}>
          <Text c="dimmed">Loading player...</Text>
        </Center>
      </AppLayout>
    );
  }

  if (!player) {
    return (
      <AppLayout>
        <Center py={60}>
          <Stack align="center">
            <Title order={3}>Player not found</Title>
            <Button component={Link} to="/players">
              Back to Players
            </Button>
          </Stack>
        </Center>
      </AppLayout>
    );
  }

  // Calculate season totals
  const totals = stats?.reduce(
    (acc, week) => ({
      passingYards: acc.passingYards + (week.passingYards || 0),
      passingTds: acc.passingTds + (week.passingTds || 0),
      passingInts: acc.passingInts + (week.passingInts || 0),
      rushingYards: acc.rushingYards + (week.rushingYards || 0),
      rushingTds: acc.rushingTds + (week.rushingTds || 0),
      receptions: acc.receptions + (week.receptions || 0),
      receivingYards: acc.receivingYards + (week.receivingYards || 0),
      receivingTds: acc.receivingTds + (week.receivingTds || 0),
    }),
    {
      passingYards: 0,
      passingTds: 0,
      passingInts: 0,
      rushingYards: 0,
      rushingTds: 0,
      receptions: 0,
      receivingYards: 0,
      receivingTds: 0,
    }
  );

  return (
    <AppLayout>
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <Title order={1}>{player.name}</Title>
            <Group>
              <Badge size="lg" variant="light" color="violet">
                {player.position}
              </Badge>
              <Badge size="lg" variant="outline">
                {player.team}
              </Badge>
            </Group>
          </Group>
          <Group gap="md">
            <Text c="dimmed">
              {player.status === 'active' ? '✓ Active' : player.status}
            </Text>
            {player.jerseyNumber && (
              <Text c="dimmed">#{player.jerseyNumber}</Text>
            )}
          </Group>
        </div>

        {/* Season Totals */}
        {stats && stats.length > 0 && (
          <div>
            <Title order={3} size="h4" mb="md">
              {CURRENT_SEASON} Season Totals
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 4, md: 6 }}>
              {totals.passingYards > 0 && (
                <>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Pass Yds
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.passingYards}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Pass TDs
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.passingTds}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      INTs
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.passingInts}
                    </Text>
                  </Paper>
                </>
              )}
              {totals.rushingYards > 0 && (
                <>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Rush Yds
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.rushingYards}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Rush TDs
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.rushingTds}
                    </Text>
                  </Paper>
                </>
              )}
              {totals.receptions > 0 && (
                <>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Rec
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.receptions}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Rec Yds
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.receivingYards}
                    </Text>
                  </Paper>
                  <Paper withBorder p="md" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                      Rec TDs
                    </Text>
                    <Text size="xl" fw={700}>
                      {totals.receivingTds}
                    </Text>
                  </Paper>
                </>
              )}
            </SimpleGrid>
          </div>
        )}

        {/* Fantasy Scoring */}
        {leagues && leagues.length > 0 && (
          <Alert color="blue" title="Fantasy Points">
            <Text size="sm" mb="sm">
              Select a league to see how this player would score with your league's settings.
              Click on a week number below to see the detailed score breakdown.
            </Text>
            <Select
              label="Select League"
              placeholder="Choose a league"
              data={
                leagues.map((league) => ({
                  value: league.currentSeason?.id || '',
                  label: `${league.name} (${league.currentSeason?.season || 'N/A'})`,
                })) || []
              }
              value={selectedLeagueSeasonId}
              onChange={setSelectedLeagueSeasonId}
              w={300}
            />
          </Alert>
        )}

        {/* Weekly Stats */}
        <div>
          <Title order={3} size="h4" mb="md">
            Weekly Stats
            {selectedLeagueSeasonId && (
              <Text span c="dimmed" size="sm" fw={400} ml="xs">
                (Click week to see fantasy points)
              </Text>
            )}
          </Title>
          {stats && stats.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="md"
              striped
              highlightOnHover
              records={stats}
              columns={[
                {
                  accessor: 'weekNumber',
                  title: 'Week',
                  width: 80,
                  render: (record) => (
                    <Badge
                      variant="light"
                      color="violet"
                      style={
                        selectedLeagueSeasonId
                          ? { cursor: 'pointer' }
                          : undefined
                      }
                      onClick={() => {
                        if (selectedLeagueSeasonId) {
                          setSelectedWeek(record.weekNumber);
                        }
                      }}
                    >
                      {record.weekNumber}
                    </Badge>
                  ),
                },
                ...(player.position === 'QB'
                  ? [
                      {
                        accessor: 'passingYards',
                        title: 'Pass Yds',
                        textAlign: 'right' as const,
                        render: (record: any) => record.passingYards || '-',
                      },
                      {
                        accessor: 'passingTds',
                        title: 'Pass TDs',
                        textAlign: 'right' as const,
                        render: (record: any) => record.passingTds || '-',
                      },
                      {
                        accessor: 'passingInts',
                        title: 'INTs',
                        textAlign: 'right' as const,
                        render: (record: any) => record.passingInts || '-',
                      },
                      {
                        accessor: 'completions',
                        title: 'Comp/Att',
                        textAlign: 'right' as const,
                        render: (record: any) =>
                          record.completions && record.attempts
                            ? `${record.completions}/${record.attempts}`
                            : '-',
                      },
                    ]
                  : []),
                ...(player.position === 'RB' || player.position === 'QB'
                  ? [
                      {
                        accessor: 'rushingYards',
                        title: 'Rush Yds',
                        textAlign: 'right' as const,
                        render: (record: any) => record.rushingYards || '-',
                      },
                      {
                        accessor: 'rushingTds',
                        title: 'Rush TDs',
                        textAlign: 'right' as const,
                        render: (record: any) => record.rushingTds || '-',
                      },
                      {
                        accessor: 'rushingAttempts',
                        title: 'Rush Att',
                        textAlign: 'right' as const,
                        render: (record: any) => record.rushingAttempts || '-',
                      },
                    ]
                  : []),
                ...(player.position === 'WR' ||
                player.position === 'TE' ||
                player.position === 'RB'
                  ? [
                      {
                        accessor: 'receptions',
                        title: 'Rec',
                        textAlign: 'right' as const,
                        render: (record: any) => record.receptions || '-',
                      },
                      {
                        accessor: 'receivingYards',
                        title: 'Rec Yds',
                        textAlign: 'right' as const,
                        render: (record: any) => record.receivingYards || '-',
                      },
                      {
                        accessor: 'receivingTds',
                        title: 'Rec TDs',
                        textAlign: 'right' as const,
                        render: (record: any) => record.receivingTds || '-',
                      },
                      {
                        accessor: 'targets',
                        title: 'Targets',
                        textAlign: 'right' as const,
                        render: (record: any) => record.targets || '-',
                      },
                    ]
                  : []),
                {
                  accessor: 'fumblesLost',
                  title: 'Fumbles',
                  width: 100,
                  textAlign: 'right' as const,
                  render: (record) => record.fumblesLost || '-',
                },
              ]}
            />
          ) : (
            <Paper withBorder p="xl" radius="md">
              <Text c="dimmed" ta="center">
                No stats available for this player
              </Text>
            </Paper>
          )}
        </div>
      </Stack>

      {/* Score Breakdown Modal */}
      <Modal
        opened={selectedWeek !== null}
        onClose={() => setSelectedWeek(null)}
        title={
          <Group>
            <Text fw={700}>
              {player?.name} - Week {selectedWeek}
            </Text>
            {scoreData && (
              <Badge size="lg" variant="filled" color="violet">
                {scoreData.totalPoints.toFixed(2)} pts
              </Badge>
            )}
          </Group>
        }
        size="md"
      >
        {scoreLoading ? (
          <Center p="xl">
            <Stack align="center" gap="sm">
              <Text c="dimmed">Calculating fantasy points...</Text>
            </Stack>
          </Center>
        ) : scoreData ? (
          <ScoreBreakdown
            breakdown={scoreData.breakdown}
            totalPoints={scoreData.totalPoints}
          />
        ) : (
          <Text c="dimmed" ta="center" p="xl">
            No data available for this week
          </Text>
        )}
      </Modal>
    </AppLayout>
  );
}
