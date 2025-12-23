import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/hooks/trpc';
import { Title, Text, SimpleGrid, Paper, Stack, Anchor } from '@mantine/core';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const { data: leagues, isLoading } = trpc.leagues.list.useQuery();

  return (
    <AppLayout>
      <Title order={1} mb="xs">
        Your Leagues
      </Title>
      <Text c="dimmed" mb="xl">
        Welcome to your fantasy football platform
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            Your Leagues
          </Text>
          <Text size="xl" fw={700}>
            {isLoading ? '...' : leagues?.length || 0}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            Active Teams
          </Text>
          <Text size="xl" fw={700}>
            {leagues?.length || 0}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            This Week
          </Text>
          <Text size="xl" fw={700}>
            -
          </Text>
        </Paper>
      </SimpleGrid>

      <Title order={2} size="h3" mb="md">
        My Leagues
      </Title>
      {isLoading ? (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            Loading leagues...
          </Text>
        </Paper>
      ) : leagues && leagues.length > 0 ? (
        <Stack gap="md">
          {leagues.map((league) => (
            <Paper key={league.id} withBorder p="md" radius="md">
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
                {' • '}
                {league.currentSeason?.status || 'setup'}
              </Text>
            </Paper>
          ))}
        </Stack>
      ) : (
        <Paper withBorder p="xl" radius="md">
          <Text c="dimmed" ta="center">
            You're not in any leagues yet. Create or join a league to get
            started!
          </Text>
        </Paper>
      )}
    </AppLayout>
  );
}
