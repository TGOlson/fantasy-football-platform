import { useLoaderData, useParams } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/lib/league-context';
import { trpc } from '@/lib/trpc';
import {
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  Center,
  SimpleGrid,
  Modal,
  Title,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { ScoreBreakdown } from '@/components/score-breakdown';
import {
  PageHeader,
  PositionBadge,
  StatCard,
  HistoricalBanner,
} from '@/components/ui';
import { loader } from './loader';

export function PlayerDetailPage() {
  const { player } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { leagueSlug, year, playerId } = useParams<{
    leagueSlug: string;
    year: string;
    playerId: string;
  }>();
  const { league, leagueSeason, isHistoricalYear, mostRecentLeagueYear } =
    useLeague();

  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  const { data: stats } = trpc.players.getStats.useQuery({
    id: playerId!,
    season: leagueSeason.year,
  });

  // Get score breakdown for selected week
  const { data: scoreData, isLoading: scoreLoading } =
    trpc.scoring.calculatePlayerScore.useQuery(
      {
        playerId: playerId!,
        season: leagueSeason.year,
        weekNumber: selectedWeek!,
        leagueSeasonId: leagueSeason.id,
      },
      {
        enabled: !!playerId && !!selectedWeek,
      }
    );

  // Calculate season totals
  const totals = (stats ?? []).reduce(
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

  // Build subtitle with status and jersey number
  const subtitleParts = [];
  if (player.status === 'active') {
    subtitleParts.push('Active');
  } else if (player.status) {
    subtitleParts.push(player.status);
  }
  if (player.jerseyNumber) {
    subtitleParts.push(`#${player.jerseyNumber}`);
  }

  return (
    <AppLayout>
      <Stack gap="lg">
        {isHistoricalYear && (
          <HistoricalBanner
            year={leagueSeason.year}
            currentYearPath={`/${leagueSlug}/${mostRecentLeagueYear}/players/${playerId}`}
          />
        )}

        {/* Header */}
        <PageHeader
          title={player.name}
          subtitle={subtitleParts.join(' • ') || undefined}
          breadcrumbs={[
            { label: league.name, to: `/${leagueSlug}/${year}` },
            { label: 'Players', to: `/${leagueSlug}/${year}/players` },
            { label: player.name },
          ]}
          badges={
            <Group gap="xs">
              <PositionBadge position={player.position} />
              <Badge size="lg" variant="outline">
                {player.team}
              </Badge>
            </Group>
          }
        />

        {/* Season Totals */}
        {stats && stats.length > 0 && (
          <div>
            <Title order={3} size="h4" mb="md">
              Season Totals
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 4, md: 6 }}>
              {totals.passingYards > 0 && (
                <>
                  <StatCard
                    label="Pass Yds"
                    value={totals.passingYards.toLocaleString()}
                  />
                  <StatCard label="Pass TDs" value={totals.passingTds} />
                  <StatCard label="INTs" value={totals.passingInts} />
                </>
              )}
              {totals.rushingYards > 0 && (
                <>
                  <StatCard
                    label="Rush Yds"
                    value={totals.rushingYards.toLocaleString()}
                  />
                  <StatCard label="Rush TDs" value={totals.rushingTds} />
                </>
              )}
              {totals.receptions > 0 && (
                <>
                  <StatCard label="Rec" value={totals.receptions} />
                  <StatCard
                    label="Rec Yds"
                    value={totals.receivingYards.toLocaleString()}
                  />
                  <StatCard label="Rec TDs" value={totals.receivingTds} />
                </>
              )}
            </SimpleGrid>
          </div>
        )}

        {/* Weekly Stats */}
        <div>
          <Title order={3} size="h4" mb="md">
            Weekly Stats
            <Text span c="dimmed" size="sm" fw={400} ml="xs">
              (Click week to see fantasy points)
            </Text>
          </Title>
          {stats && stats.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="sm"
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
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedWeek(record.weekNumber)}
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
