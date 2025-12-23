import { useLoaderData, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/providers/league-provider';
import {
  Text,
  Paper,
  Stack,
  Badge,
  SimpleGrid,
  Title,
  Group,
  Box,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { loader } from './loader';
import {
  PageHeader,
  StatCard,
  PlayerCell,
  PositionBadge,
  HistoricalBanner,
} from '@/components/ui';

// Helper to get score color - functional highlighting for scannability
function getScoreStyle(score: string | number | null | undefined) {
  if (!score) return {};
  const pts = typeof score === 'string' ? parseFloat(score) : score;
  if (pts >= 20)
    return { color: 'var(--mantine-color-teal-7)', fontWeight: 700 };
  if (pts >= 10) return { fontWeight: 600 };
  return { color: 'var(--mantine-color-gray-6)' };
}

export function FranchiseDetailPage() {
  const { franchise, settings } = useLoaderData() as Awaited<
    ReturnType<typeof loader>
  >;
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { league, isHistoricalYear, mostRecentLeagueYear } = useLeague();

  // Get the number of starter slots (all non-bench slots)
  const starterSlotCount =
    settings.rosterSlots?.filter((slot) => slot.type !== 'bench').length || 0;

  const starters =
    franchise.lineup?.filter((p) => p.rosterSlotIndex < starterSlotCount) || [];
  const bench =
    franchise.lineup?.filter((p) => p.rosterSlotIndex >= starterSlotCount) ||
    [];

  const wins = franchise.franchiseSeason?.wins || 0;
  const losses = franchise.franchiseSeason?.losses || 0;
  const ties = franchise.franchiseSeason?.ties || 0;
  const record = `${wins}-${losses}-${ties}`;

  // Record badge - semantic color for quick scan
  const recordColor =
    wins > losses
      ? {
          bg: 'var(--mantine-color-teal-1)',
          color: 'var(--mantine-color-teal-8)',
        }
      : wins < losses
        ? {
            bg: 'var(--mantine-color-red-1)',
            color: 'var(--mantine-color-red-8)',
          }
        : {
            bg: 'var(--mantine-color-gray-2)',
            color: 'var(--mantine-color-gray-7)',
          };

  return (
    <AppLayout>
      <Stack gap="md">
        {isHistoricalYear && (
          <HistoricalBanner
            year={parseInt(year!)}
            currentYearPath={`/${leagueSlug}/${mostRecentLeagueYear}/franchises/${franchise.id}`}
          />
        )}

        <PageHeader
          title={franchise.name}
          subtitle={`Owner: ${franchise.owner?.name || 'Unknown'}`}
          breadcrumbs={[
            { label: league.name, to: `/${leagueSlug}/${year}` },
            { label: 'Franchises' },
            { label: franchise.name },
          ]}
          badges={
            <Badge
              size="lg"
              variant="filled"
              styles={{
                root: {
                  backgroundColor: recordColor.bg,
                  color: recordColor.color,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                },
              }}
            >
              {record}
            </Badge>
          }
        />

        {/* Stats row - semantic colors on wins/losses for quick scanning */}
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatCard
            label="Points For"
            value={franchise.franchiseSeason?.pointsFor || '0.00'}
          />
          <StatCard
            label="Points Against"
            value={franchise.franchiseSeason?.pointsAgainst || '0.00'}
          />
          <Paper withBorder shadow="xs" p="sm">
            <Text size="xs" c="dimmed" fw={500} mb={2}>
              Wins
            </Text>
            <Text
              fw={700}
              c="teal.7"
              style={{ fontSize: '1.5rem', lineHeight: 1.2 }}
            >
              {wins}
            </Text>
          </Paper>
          <Paper withBorder shadow="xs" p="sm">
            <Text size="xs" c="dimmed" fw={500} mb={2}>
              Losses
            </Text>
            <Text
              fw={700}
              c="red.7"
              style={{ fontSize: '1.5rem', lineHeight: 1.2 }}
            >
              {losses}
            </Text>
          </Paper>
        </SimpleGrid>

        {/* Starting Lineup */}
        <Paper withBorder shadow="xs" p={0} style={{ overflow: 'hidden' }}>
          <Group
            justify="space-between"
            px="sm"
            py="xs"
            bg="gray.1"
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
          >
            <Title order={5} fw={600}>
              Starting Lineup
            </Title>
            <Text size="sm" c="dimmed">
              Projected: -
            </Text>
          </Group>
          {starters.length > 0 ? (
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              horizontalSpacing="sm"
              verticalSpacing="xs"
              records={starters}
              styles={{
                header: {
                  backgroundColor: 'var(--mantine-color-gray-0)',
                },
              }}
              columns={[
                {
                  accessor: 'rosterSlotIndex',
                  title: 'Slot',
                  width: 55,
                  render: (record) => {
                    const slot = settings.rosterSlots?.[record.rosterSlotIndex];
                    const slotLabel =
                      slot?.type === 'starter'
                        ? slot.positions.join('/')
                        : 'BENCH';
                    return (
                      <Badge
                        size="xs"
                        variant="light"
                        color="gray"
                        styles={{ root: { fontWeight: 600 } }}
                      >
                        {slotLabel}
                      </Badge>
                    );
                  },
                },
                {
                  accessor: 'playerName',
                  title: 'Player',
                  render: (record) => (
                    <PlayerCell
                      name={record.playerName}
                      position={record.position}
                      team={record.nflTeam}
                    />
                  ),
                },
                {
                  accessor: 'position',
                  title: 'Pos',
                  width: 50,
                  render: (record) => (
                    <PositionBadge position={record.position} />
                  ),
                },
                {
                  accessor: 'opponent',
                  title: 'Opp',
                  width: 55,
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'projected',
                  title: 'Proj',
                  width: 55,
                  textAlign: 'right',
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'pointsScored',
                  title: 'Pts',
                  width: 55,
                  textAlign: 'right',
                  render: (record) => (
                    <Text size="sm" style={getScoreStyle(record.pointsScored)}>
                      {record.pointsScored || '-'}
                    </Text>
                  ),
                },
              ]}
            />
          ) : (
            <Box p="md">
              <Text c="dimmed" ta="center" size="sm">
                No starters set
              </Text>
            </Box>
          )}
        </Paper>

        {/* Bench */}
        <Paper withBorder shadow="xs" p={0} style={{ overflow: 'hidden' }}>
          <Group
            justify="space-between"
            px="sm"
            py="xs"
            bg="gray.1"
            style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
          >
            <Title order={5} fw={600}>
              Bench
            </Title>
            <Badge size="sm" variant="light" color="gray">
              {bench.length}
            </Badge>
          </Group>
          {bench.length > 0 ? (
            <DataTable
              withTableBorder={false}
              borderRadius={0}
              highlightOnHover
              horizontalSpacing="sm"
              verticalSpacing="xs"
              records={bench}
              styles={{
                header: {
                  backgroundColor: 'var(--mantine-color-gray-0)',
                },
              }}
              columns={[
                {
                  accessor: 'playerName',
                  title: 'Player',
                  render: (record) => (
                    <PlayerCell
                      name={record.playerName}
                      position={record.position}
                      team={record.nflTeam}
                    />
                  ),
                },
                {
                  accessor: 'position',
                  title: 'Pos',
                  width: 50,
                  render: (record) => (
                    <PositionBadge position={record.position} />
                  ),
                },
                {
                  accessor: 'opponent',
                  title: 'Opp',
                  width: 55,
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'projected',
                  title: 'Proj',
                  width: 55,
                  textAlign: 'right',
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'pointsScored',
                  title: 'Pts',
                  width: 55,
                  textAlign: 'right',
                  render: (record) => (
                    <Text size="sm" style={getScoreStyle(record.pointsScored)}>
                      {record.pointsScored || '-'}
                    </Text>
                  ),
                },
              ]}
            />
          ) : (
            <Box p="md">
              <Text c="dimmed" ta="center" size="sm">
                No bench players
              </Text>
            </Box>
          )}
        </Paper>

        <Paper withBorder p="sm" bg="gray.1">
          <Text size="sm" c="dimmed">
            Coming soon: Transactions, Schedule, Results
          </Text>
        </Paper>
      </Stack>
    </AppLayout>
  );
}
