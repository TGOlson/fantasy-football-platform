import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/lib/trpc';
import { POSITIONS, NFL_TEAMS, CURRENT_SEASON } from '@fantasy-platform/types';
import { Title, Text, TextInput, Select, Group, Badge } from '@mantine/core';
import { DataTable } from 'mantine-datatable';

export function PlayersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<string | null>(null);
  const [team, setTeam] = useState<string | null>(null);

  const { data: players, isLoading } = trpc.players.list.useQuery({
    season: CURRENT_SEASON,
    search: search || undefined,
    position: position || undefined,
    team: team || undefined,
  });

  return (
    <AppLayout>
      <Title order={1} mb="xs">Players</Title>
      <Text c="dimmed" mb="xl">
        Browse and search NFL players
      </Text>

      <Group mb="lg" align="flex-end">
        <TextInput
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <Select
          placeholder="All Positions"
          data={[...POSITIONS]}
          value={position}
          onChange={setPosition}
          clearable
          w={150}
        />
        <Select
          placeholder="All Teams"
          data={[...NFL_TEAMS]}
          value={team}
          onChange={setTeam}
          clearable
          w={150}
        />
      </Group>

      <DataTable
        withTableBorder
        borderRadius="md"
        striped
        highlightOnHover
        records={players || []}
        fetching={isLoading}
        onRowClick={({ record }) => navigate(`/players/${record.id}`)}
        style={{ cursor: 'pointer' }}
        columns={[
          {
            accessor: 'name',
            title: 'Player',
            width: '40%',
          },
          {
            accessor: 'position',
            title: 'Position',
            width: 100,
            render: (player) => (
              <Badge variant="light" color="violet">
                {player.position}
              </Badge>
            ),
          },
          {
            accessor: 'team',
            title: 'Team',
            render: (player) => (
              <Text c="dimmed">{player.team || '-'}</Text>
            ),
          },
        ]}
        noRecordsText="No players found"
      />
    </AppLayout>
  );
}
