import { Link } from 'react-router-dom';
import { trpc } from '@/hooks/trpc';
import {
  Button,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Group,
  Center,
  Stack,
} from '@mantine/core';

export function LeaguesPage() {
  const { data: leagues, isLoading } = trpc.leagues.list.useQuery();

  return (
    <>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={1} mb="xs">
            Leagues
          </Title>
          <Text c="dimmed">Manage your fantasy football leagues</Text>
        </div>
        <Button>Create League</Button>
      </Group>

      {isLoading ? (
        <Center py={60}>
          <Text c="dimmed">Loading leagues...</Text>
        </Center>
      ) : leagues && leagues.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {leagues.map((league) => (
            <Paper
              key={league.id}
              component={Link}
              to={`/leagues/${league.id}`}
              withBorder
              p="lg"
              radius="md"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  'var(--mantine-color-violet-6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '';
              }}
            >
              <Title order={3} size="h4" mb="xs">
                {league.name}
              </Title>
              <Text size="sm" c="dimmed" mb="md">
                Season {league.currentSeason?.year || 'N/A'}
              </Text>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {league.currentSeason?.status || 'Setup'}
                </Text>
                <Text size="sm" c="violet">
                  View →
                </Text>
              </Group>
            </Paper>
          ))}
        </SimpleGrid>
      ) : (
        <Paper withBorder p={60} radius="md">
          <Stack align="center" gap="md">
            <Title order={3} size="h4">
              No leagues yet
            </Title>
            <Text c="dimmed" mb="md">
              Create your first league to get started
            </Text>
            <Button>Create League</Button>
          </Stack>
        </Paper>
      )}
    </>
  );
}
