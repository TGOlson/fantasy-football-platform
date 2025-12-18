import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/lib/league-context';
import { trpc } from '@/lib/trpc';
import { POSITIONS, NFL_TEAMS } from '@fantasy-platform/types';
import { TextInput, Select, Group, Text, Stack, Paper } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import { PageHeader, PlayerCell, PositionBadge, HistoricalBanner } from '@/components/ui';

export function PlayersPage() {
  const navigate = useNavigate();
  const { leagueSlug, year } = useParams<{ leagueSlug: string; year: string }>();
  const { league, leagueSeason, isHistoricalYear, mostRecentLeagueYear } = useLeague();

  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);

  const { data: players, isLoading } = trpc.players.list.useQuery({
    season: leagueSeason.year,
    search: search || undefined,
    position: position || undefined,
    team: team || undefined,
  });

  return (
    <AppLayout>
      <Stack gap="md">
        {isHistoricalYear && (
          <HistoricalBanner
            year={leagueSeason.year}
            currentYearPath={`/${leagueSlug}/${mostRecentLeagueYear}/players`}
          />
        )}

        <PageHeader
          title="Players"
          subtitle="Browse and search NFL players"
          breadcrumbs={[
            { label: league.name, to: `/${leagueSlug}/${year}` },
            { label: 'Players' },
          ]}
        />

        {/* Filters */}
        <Paper withBorder p="sm">
          <Group gap="sm">
            <TextInput
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Position"
              data={[...POSITIONS]}
              value={position}
              onChange={setPosition}
              clearable
              w={120}
            />
            <Select
              placeholder="Team"
              data={[...NFL_TEAMS]}
              value={team}
              onChange={setTeam}
              clearable
              searchable
              w={120}
            />
          </Group>
        </Paper>

        {/* Players Table */}
        <DataTable
          withTableBorder
          borderRadius="sm"
          highlightOnHover
          records={players || []}
          fetching={isLoading}
          onRowClick={({ record }) =>
            navigate(`/${leagueSlug}/${year}/players/${record.id}`)
          }
          minHeight={400}
          noRecordsText="No players found"
          columns={[
            {
              accessor: 'name',
              title: 'Player',
              render: (player) => (
                <PlayerCell
                  name={player.name}
                  position={player.position}
                  team={player.team || '-'}
                  status={player.status}
                />
              ),
            },
            {
              accessor: 'position',
              title: 'Pos',
              width: 70,
              render: (player) => <PositionBadge position={player.position} />,
            },
            {
              accessor: 'team',
              title: 'Team',
              width: 80,
              render: (player) => (
                <Text size="sm" c="dimmed">
                  {player.team || '-'}
                </Text>
              ),
            },
            {
              accessor: 'points',
              title: 'Pts',
              width: 80,
              textAlign: 'right',
              render: () => (
                <Text size="sm" c="dimmed">
                  -
                </Text>
              ),
            },
            {
              accessor: 'rank',
              title: 'Rank',
              width: 80,
              textAlign: 'right',
              render: () => (
                <Text size="sm" c="dimmed">
                  -
                </Text>
              ),
            },
          ]}
        />

        {/* TODO: Pagination */}
        {players && players.length > 0 && (
          <Text size="sm" c="dimmed" ta="right">
            Showing {players.length} players
          </Text>
        )}
      </Stack>
    </AppLayout>
  );
}
