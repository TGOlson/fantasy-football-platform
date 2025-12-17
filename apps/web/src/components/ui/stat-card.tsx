import { Paper, Text, Group, Tooltip, ActionIcon } from '@mantine/core';
import { IconInfoCircle, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';

type StatCardProps = {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string;
  };
  info?: string;
};

export function StatCard({ label, value, trend, info }: StatCardProps) {
  const trendColor = trend
    ? trend.value > 0
      ? 'green'
      : trend.value < 0
        ? 'red'
        : 'dimmed'
    : undefined;

  const TrendIcon = trend
    ? trend.value > 0
      ? IconTrendingUp
      : trend.value < 0
        ? IconTrendingDown
        : null
    : null;

  return (
    <Paper withBorder p="sm">
      <Group justify="space-between" mb={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
        {info && (
          <Tooltip label={info} withArrow>
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconInfoCircle size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      {trend && (
        <Group gap={4} mt={4}>
          {TrendIcon && <TrendIcon size={14} color={`var(--mantine-color-${trendColor}-6)`} />}
          <Text size="xs" c={trendColor} fw={500}>
            {trend.value > 0 ? '+' : ''}
            {trend.value}
            {trend.label && ` ${trend.label}`}
          </Text>
        </Group>
      )}
    </Paper>
  );
}
