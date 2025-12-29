import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Title,
  Text,
  Stack,
  Group,
  Button,
  Paper,
  Table,
  Skeleton,
  Alert,
} from '@mantine/core';
import { graphqlClient } from '@/lib/graphql-client';
import { TeamDocument, TeamWeekDocument } from '@/generated/graphql';
import { useLeagueContext } from '@/providers/league-provider';
import { useNFLSeasonContext } from '@/providers/nfl-season-provider';

export function TeamPage() {
  const { teamId, weekNumber, leagueSlug, year } = useParams<{
    teamId: string;
    weekNumber: string;
    leagueSlug: string;
    year: string;
  }>();
  const navigate = useNavigate();
  const { season } = useLeagueContext();
  const { currentWeek } = useNFLSeasonContext();

  const week = parseInt(weekNumber!, 10);

  // Query 1: Team data (cached once per team)
  const {
    data: teamData,
    isLoading: teamLoading,
    error: teamError,
  } = useQuery({
    queryKey: ['team', leagueSlug, teamId],
    queryFn: () =>
      graphqlClient.request(TeamDocument, {
        leagueSlug: leagueSlug!,
        teamId: teamId!,
      }),
    enabled: !!leagueSlug && !!teamId,
  });

  // Query 2: Week-specific data (cached per team + week)
  const {
    data: weekData,
    isLoading: weekLoading,
    error: weekError,
  } = useQuery({
    queryKey: ['teamWeek', leagueSlug, teamId, week],
    queryFn: () =>
      graphqlClient.request(TeamWeekDocument, {
        leagueSlug: leagueSlug!,
        teamId: teamId!,
        weekNumber: week,
      }),
    enabled: !!leagueSlug && !!teamId && !!weekNumber,
  });

  // Loading state
  if (teamLoading || weekLoading) {
    return (
      <Stack gap="md">
        <Skeleton height={60} />
        <Skeleton height={40} />
        <Skeleton height={400} />
      </Stack>
    );
  }

  // Error state
  if (teamError || weekError) {
    const error = teamError || weekError;
    return (
      <Alert color="red" title="Error loading team">
        {error instanceof Error ? error.message : 'Failed to load team'}
      </Alert>
    );
  }

  // No team found
  if (!teamData?.league?.team) {
    return <Alert color="yellow">Team not found</Alert>;
  }

  const team = teamData.league.team;
  const matchup = weekData?.league?.matchup;
  const lineup = weekData?.league?.weeklyLineups ?? [];

  // Compute place in league
  const sortedTeams = [...season.teams].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.pointsFor - a.pointsFor;
  });
  const place = sortedTeams.findIndex((t) => t.id === team.id) + 1;

  // Week navigation
  const canGoBack = week > 1;
  const canGoForward = week < currentWeek;

  const handlePrevWeek = () => {
    if (canGoBack) {
      navigate(`/${leagueSlug}/${year}/teams/${teamId}/w/${week - 1}`);
    }
  };

  const handleNextWeek = () => {
    if (canGoForward) {
      navigate(`/${leagueSlug}/${year}/teams/${teamId}/w/${week + 1}`);
    }
  };

  // Determine if this team is home or away in matchup
  const isHome = matchup?.homeTeam.id === team.id;
  const opponent = isHome ? matchup?.awayTeam : matchup?.homeTeam;
  const teamScore = isHome ? matchup?.homeScore : matchup?.awayScore;
  const opponentScore = isHome ? matchup?.awayScore : matchup?.homeScore;

  return (
    <Stack gap="md">
      {/* Team header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={1}>{team.name}</Title>
          <Text c="dimmed" size="sm">
            {team.owner.name}
          </Text>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Text size="lg" fw={500}>
            {team.wins}-{team.losses}-{team.ties}
          </Text>
          <Text c="dimmed" size="sm">
            {place}
            {place === 1 ? 'st' : place === 2 ? 'nd' : place === 3 ? 'rd' : 'th'}{' '}
            place
          </Text>
        </div>
      </Group>

      {/* Matchup preview/result */}
      {matchup && (
        <Paper withBorder p="md">
          <Group justify="space-between">
            <div>
              <Text fw={500}>{team.name}</Text>
              <Text size="xl" fw={700}>
                {teamScore?.toFixed(2) ?? '0.00'}
              </Text>
            </div>
            <Text c="dimmed" size="sm">
              {matchup.completedAt ? 'Final' : 'In Progress'}
            </Text>
            <div style={{ textAlign: 'right' }}>
              <Text fw={500}>{opponent?.name ?? 'BYE'}</Text>
              <Text size="xl" fw={700}>
                {opponentScore?.toFixed(2) ?? '0.00'}
              </Text>
            </div>
          </Group>
        </Paper>
      )}

      {/* Week navigation */}
      <Group justify="center" gap="md">
        <Button onClick={handlePrevWeek} disabled={!canGoBack} variant="default">
          ← Week {week - 1}
        </Button>
        <Text fw={500}>Week {week}</Text>
        <Button onClick={handleNextWeek} disabled={!canGoForward} variant="default">
          Week {week + 1} →
        </Button>
      </Group>

      {/* Lineup */}
      <Paper withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Slot</Table.Th>
              <Table.Th>Player</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Points</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {lineup.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" ta="center">
                    No lineup set for this week
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              lineup.map((slot) => (
                <Table.Tr key={slot.id}>
                  <Table.Td>{slot.rosterSlotIndex + 1}</Table.Td>
                  <Table.Td>{slot.player.name}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {slot.pointsScored.toFixed(2)}
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
