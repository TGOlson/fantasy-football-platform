import { Title, Text, Paper, Stack, Anchor, Skeleton } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql-client';
import { MyLeaguesDocument } from '@/generated/graphql';

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['myLeagues'],
    queryFn: () => graphqlClient.request(MyLeaguesDocument),
  });

  if (isLoading) {
    return (
      <>
        <Title order={1} mb="md">
          Your Leagues
        </Title>
        <Stack gap="md">
          <Skeleton height={80} />
          <Skeleton height={80} />
          <Skeleton height={80} />
        </Stack>
      </>
    );
  }

  const leagues = data?.myLeagues || [];

  return (
    <>
      <Title order={1} mb="md">
        Your Leagues
      </Title>

      {leagues.length > 0 ? (
        <Stack gap="md">
          {leagues.map((league) => (
            <Paper key={league.id} withBorder p="md">
              <Anchor
                component={Link}
                to={`/${league.slug}/${league.currentSeason?.year || new Date().getFullYear()}`}
                size="lg"
                fw={600}
              >
                {league.name}
              </Anchor>
              <Text size="sm" c="dimmed" mt="xs">
                {league.currentSeason?.year || 'No active season'}
              </Text>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper withBorder p="xl">
          <Text c="dimmed" ta="center">
            You're not in any leagues yet.
          </Text>
        </Paper>
      )}
    </>
  );
}
