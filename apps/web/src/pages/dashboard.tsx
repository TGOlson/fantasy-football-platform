import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/lib/trpc';
import { Title, Text, SimpleGrid, Paper, Group } from '@mantine/core';

export function DashboardPage() {
  const { data: leagues, isLoading } = trpc.leagues.list.useQuery();

  return (
    <AppLayout>
      <Title order={1} mb="xs">Dashboard</Title>
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
          <Text size="xl" fw={700}>0</Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb="xs">
            This Week
          </Text>
          <Text size="xl" fw={700}>-</Text>
        </Paper>
      </SimpleGrid>

      <Title order={2} size="h3" mb="md">Recent Activity</Title>
      <Paper withBorder p="xl" radius="md">
        <Text c="dimmed" ta="center">
          No recent activity
        </Text>
      </Paper>
    </AppLayout>
  );
}
