import { useLoaderData, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import {
  Title,
  Text,
  Paper,
  Group,
  Stack,
  Badge,
  SimpleGrid,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { loader } from './loader';

export function TeamDetailPage() {
  const { team } = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const starters = team.roster?.filter((p) => p.slotType !== 'BENCH') || [];
  const bench = team.roster?.filter((p) => p.slotType === 'BENCH') || [];

  return (
    <AppLayout>
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <Title order={1}>{team.name}</Title>
            {team.teamSeason && (
              <Badge size="lg" variant="light">
                {team.teamSeason.wins}-{team.teamSeason.losses}-
                {team.teamSeason.ties}
              </Badge>
            )}
          </Group>
          <Group gap="md">
            <Text c="dimmed">Owner: {team.owner?.name}</Text>
            {team.league && (
              <Text c="dimmed">
                League:{' '}
                <Text
                  component={Link}
                  to={`/leagues/${team.league.id}`}
                  span
                  c="violet"
                  style={{ textDecoration: 'none' }}
                >
                  {team.league.name}
                </Text>
              </Text>
            )}
          </Group>
        </div>

        {/* Stats */}
        {team.teamSeason && (
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Points For
              </Text>
              <Text size="xl" fw={700}>
                {team.teamSeason.pointsFor || '0.00'}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Points Against
              </Text>
              <Text size="xl" fw={700}>
                {team.teamSeason.pointsAgainst || '0.00'}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Wins
              </Text>
              <Text size="xl" fw={700}>
                {team.teamSeason.wins}
              </Text>
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
                Losses
              </Text>
              <Text size="xl" fw={700}>
                {team.teamSeason.losses}
              </Text>
            </Paper>
          </SimpleGrid>
        )}

        {/* Starting Lineup */}
        <div>
          <Title order={3} size="h4" mb="md">
            Starting Lineup
          </Title>
          {starters.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="md"
              striped
              records={starters}
              columns={[
                {
                  accessor: 'slotType',
                  title: 'Slot',
                  width: 80,
                  render: (record) => (
                    <Badge variant="light" color="violet">
                      {record.slotType}
                    </Badge>
                  ),
                },
                {
                  accessor: 'playerName',
                  title: 'Player',
                  render: (record) => (
                    <div>
                      <Text fw={500}>{record.playerName}</Text>
                      <Text size="xs" c="dimmed">
                        {record.position} - {record.nflTeam}
                      </Text>
                    </div>
                  ),
                },
                {
                  accessor: 'position',
                  title: 'Position',
                  width: 100,
                  render: (record) => (
                    <Badge variant="outline">{record.position}</Badge>
                  ),
                },
                {
                  accessor: 'score',
                  title: 'Score',
                  width: 100,
                  textAlign: 'right',
                  render: () => <Text c="dimmed">-</Text>,
                },
              ]}
            />
          ) : (
            <Paper withBorder p="xl" radius="md">
              <Text c="dimmed" ta="center">
                No starters set
              </Text>
            </Paper>
          )}
        </div>

        {/* Bench */}
        <div>
          <Title order={3} size="h4" mb="md">
            Bench
          </Title>
          {bench.length > 0 ? (
            <DataTable
              withTableBorder
              borderRadius="md"
              striped
              records={bench}
              columns={[
                {
                  accessor: 'playerName',
                  title: 'Player',
                  render: (record) => (
                    <div>
                      <Text fw={500}>{record.playerName}</Text>
                      <Text size="xs" c="dimmed">
                        {record.position} - {record.nflTeam}
                      </Text>
                    </div>
                  ),
                },
                {
                  accessor: 'position',
                  title: 'Position',
                  width: 100,
                  render: (record) => (
                    <Badge variant="outline">{record.position}</Badge>
                  ),
                },
                {
                  accessor: 'score',
                  title: 'Score',
                  width: 100,
                  textAlign: 'right',
                  render: () => <Text c="dimmed">-</Text>,
                },
              ]}
            />
          ) : (
            <Paper withBorder p="xl" radius="md">
              <Text c="dimmed" ta="center">
                No bench players
              </Text>
            </Paper>
          )}
        </div>
      </Stack>
    </AppLayout>
  );
}
