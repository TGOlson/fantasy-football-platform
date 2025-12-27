import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLeague } from '@/providers/league-provider';
import { trpc } from '@/hooks/trpc';
import { POSITIONS, NFL_TEAMS } from '@fantasy-platform/types/player';
import {
  TextInput,
  Select,
  Group,
  Text,
  Stack,
  Paper,
  Box,
} from '@mantine/core';
import { IconSearch, IconFilter } from '@tabler/icons-react';
import { DataTable } from 'mantine-datatable';
import {
  PageHeader,
  PlayerCell,
  PositionBadge,
  HistoricalBanner,
} from '@/components/ui';

export function PlayersPage() {
  const navigate = useNavigate();
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { league, leagueSeason, isHistoricalYear, mostRecentLeagueYear } =
    useLeague();

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
    <Stack gap="xl">
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
      <Paper withBorder p={0} style={{ overflow: 'hidden' }}>
        <Box
          p="md"
          style={{
            borderBottom: '1px solid var(--mantine-color-gray-2)',
            backgroundColor: 'var(--mantine-color-slate-0)',
          }}
        >
          <Group gap="md">
            <TextInput
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1, maxWidth: 400 }}
              styles={{
                input: {
                  backgroundColor: 'var(--mantine-color-white)',
                },
              }}
            />
            <Group gap="sm">
              <Select
                placeholder="Position"
                data={[...POSITIONS]}
                value={position}
                onChange={setPosition}
                clearable
                w={120}
                leftSection={<IconFilter size={14} />}
                styles={{
                  input: {
                    backgroundColor: 'var(--mantine-color-white)',
                  },
                }}
              />
              <Select
                placeholder="Team"
                data={[...NFL_TEAMS.map((t) => t.code)]}
                value={team}
                onChange={setTeam}
                clearable
                searchable
                w={140}
                styles={{
                  input: {
                    backgroundColor: 'var(--mantine-color-white)',
                  },
                }}
              />
            </Group>
          </Group>
        </Box>

        {/* Players Table */}
        <DataTable
          withTableBorder={false}
          borderRadius={0}
          highlightOnHover
          records={players || []}
          fetching={isLoading}
          onRowClick={({ record }) =>
            navigate(`/${leagueSlug}/${year}/players/${record.id}`)
          }
          minHeight={400}
          noRecordsText="No players found"
          styles={{
            header: {
              backgroundColor: 'var(--mantine-color-white)',
            },
          }}
          rowStyle={() => ({
            cursor: 'pointer',
          })}
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
              width: 80,
              render: (player) => <PositionBadge position={player.position} />,
            },
            {
              accessor: 'team',
              title: 'Team',
              width: 80,
              render: (player) => (
                <Text size="sm" fw={500}>
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
      </Paper>

      {/* Footer info */}
      {players && players.length > 0 && (
        <Group justify="flex-end">
          <Text size="sm" c="dimmed" fw={500}>
            Showing {players.length} players
          </Text>
        </Group>
      )}
    </Stack>
  );
}
