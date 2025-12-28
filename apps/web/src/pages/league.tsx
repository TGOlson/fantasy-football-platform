import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Title,
  Text,
  Table,
  Skeleton,
  Stack,
  Paper,
  Alert,
} from '@mantine/core';
import { graphqlClient } from '@/lib/graphql-client';
import { LeaguePageDocument } from '@/generated/graphql';

export function LeaguePage() {
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['league', leagueSlug, year],
    queryFn: () =>
      graphqlClient.request(LeaguePageDocument, {
        slug: leagueSlug!,
        year: parseInt(year!, 10),
      }),
    enabled: !!leagueSlug && !!year,
  });

  if (isLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={40} width={300} />
        <Skeleton height={400} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert color="red" title="Error loading league">
        {error instanceof Error ? error.message : 'Failed to load league'}
      </Alert>
    );
  }

  if (!data?.league) {
    return (
      <Alert color="yellow" title="League not found">
        Could not find league "{leagueSlug}" for {year}
      </Alert>
    );
  }

  const { league } = data;
  const season = league.season;

  if (!season) {
    return (
      <Alert color="yellow" title="Season not found">
        No season found for {league.name} in {year}
      </Alert>
    );
  }

  // Sort teams by wins (desc), then points for (desc)
  const sortedTeams = [...season.teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });

  return (
    <Stack gap="md">
      <div>
        <Title order={1}>{league.name}</Title>
        <Text c="dimmed" size="sm">
          {season.year} Season
        </Text>
      </div>

      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Rank</Table.Th>
              <Table.Th>Team</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>W</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>L</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>T</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>PF</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>PA</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedTeams.map((team, index) => (
              <Table.Tr key={team.id}>
                <Table.Td>{index + 1}</Table.Td>
                <Table.Td fw={500}>{team.franchise.name}</Table.Td>
                <Table.Td>{team.owner.name}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{team.wins}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {team.losses}
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>{team.ties}</Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {team.pointsFor.toFixed(2)}
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  {team.pointsAgainst.toFixed(2)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
