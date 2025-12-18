import { useLoaderData, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/lib/league-context';
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

export function FranchiseDetailPage() {
  const { franchise } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { league, isHistoricalYear, mostRecentLeagueYear } = useLeague();

  const starters =
    franchise.lineup?.filter((p) => p.slotType !== 'BENCH') || [];
  const bench = franchise.lineup?.filter((p) => p.slotType === 'BENCH') || [];

  // Build record string
  const record = franchise.franchiseSeason
    ? `${franchise.franchiseSeason.wins}-${franchise.franchiseSeason.losses}-${franchise.franchiseSeason.ties}`
    : '0-0-0';

  return (
    <AppLayout>
      <Stack gap="lg">
        {isHistoricalYear && (
          <HistoricalBanner
            year={parseInt(year!)}
            currentYearPath={`/${leagueSlug}/${mostRecentLeagueYear}/franchises/${franchise.id}`}
          />
        )}

        {/* Header */}
        <PageHeader
          title={franchise.name}
          subtitle={`Owner: ${franchise.owner?.name || 'Unknown'}`}
          breadcrumbs={[
            { label: league.name, to: `/${leagueSlug}/${year}` },
            { label: 'Franchises' },
            { label: franchise.name },
          ]}
          badges={
            <Badge size="lg" variant="light" color="violet">
              {record}
            </Badge>
          }
        />

        {/* Stats */}
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatCard
            label="Points For"
            value={franchise.franchiseSeason?.pointsFor || '0.00'}
          />
          <StatCard
            label="Points Against"
            value={franchise.franchiseSeason?.pointsAgainst || '0.00'}
          />
          <StatCard label="Wins" value={franchise.franchiseSeason?.wins || 0} />
          <StatCard
            label="Losses"
            value={franchise.franchiseSeason?.losses || 0}
          />
        </SimpleGrid>

        {/* Starting Lineup */}
        <Box>
          <Group justify="space-between" mb="sm">
            <Title order={3} size="h4">
              Starting Lineup
            </Title>
            <Text size="sm" c="dimmed">
              Projected: -
            </Text>
          </Group>
          {starters.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="sm"
              highlightOnHover
              records={starters}
              columns={[
                {
                  accessor: 'slotType',
                  title: 'Slot',
                  width: 70,
                  render: (record) => (
                    <Badge variant="filled" color="violet" size="sm">
                      {record.slotType}
                    </Badge>
                  ),
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
                  width: 70,
                  render: (record) => (
                    <PositionBadge position={record.position} />
                  ),
                },
                {
                  accessor: 'opponent',
                  title: 'Opp',
                  width: 80,
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'projected',
                  title: 'Proj',
                  width: 70,
                  textAlign: 'right',
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'pointsScored',
                  title: 'Score',
                  width: 70,
                  textAlign: 'right',
                  render: (record) => (
                    <Text size="sm" fw={600}>
                      {record.pointsScored || '-'}
                    </Text>
                  ),
                },
              ]}
            />
          ) : (
            <Paper withBorder p="xl">
              <Text c="dimmed" ta="center">
                No starters set
              </Text>
            </Paper>
          )}
        </Box>

        {/* Bench */}
        <Box>
          <Group justify="space-between" mb="sm">
            <Title order={3} size="h4">
              Bench
            </Title>
            <Text size="sm" c="dimmed">
              {bench.length} players
            </Text>
          </Group>
          {bench.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="sm"
              highlightOnHover
              records={bench}
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
                  width: 70,
                  render: (record) => (
                    <PositionBadge position={record.position} />
                  ),
                },
                {
                  accessor: 'opponent',
                  title: 'Opp',
                  width: 80,
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'projected',
                  title: 'Proj',
                  width: 70,
                  textAlign: 'right',
                  render: () => (
                    <Text size="sm" c="dimmed">
                      -
                    </Text>
                  ),
                },
                {
                  accessor: 'pointsScored',
                  title: 'Score',
                  width: 70,
                  textAlign: 'right',
                  render: (record) => (
                    <Text size="sm" fw={600}>
                      {record.pointsScored || '-'}
                    </Text>
                  ),
                },
              ]}
            />
          ) : (
            <Paper withBorder p="xl">
              <Text c="dimmed" ta="center">
                No bench players
              </Text>
            </Paper>
          )}
        </Box>

        {/* TODO Sections */}
        <Paper withBorder p="md" bg="gray.0">
          <Text size="sm" c="dimmed">
            TODO: Recent Transactions (trades, adds, drops)
          </Text>
        </Paper>

        <Paper withBorder p="md" bg="gray.0">
          <Text size="sm" c="dimmed">
            TODO: Schedule / Recent Results
          </Text>
        </Paper>
      </Stack>
    </AppLayout>
  );
}
