import { Title, Text, Paper, Stack, Anchor } from '@mantine/core';
import { Link, useRouteLoaderData } from 'react-router-dom';
import { appLoader } from '@/router/app-loader';

export function DashboardPage() {
  const { leagues } = useRouteLoaderData('app') as Awaited<
    ReturnType<typeof appLoader>
  >;

  return (
    <>
      <Title order={1} mb="md">
        Your Leagues
      </Title>

      {leagues && leagues.length > 0 ? (
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
