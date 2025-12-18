import { Paper, Text, Group, Tooltip, ActionIcon } from '@mantine/core';
import {
  IconInfoCircle,
  IconTrendingUp,
  IconTrendingDown,
} from '@tabler/icons-react';

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
  // Trend colors are semantic - green for up, red for down
  const trendColor = trend
    ? trend.value > 0
      ? 'teal'
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
    <Paper withBorder shadow="xs" p="sm">
      <Group justify="space-between" mb={2}>
        <Text size="xs" c="dimmed" fw={500}>
          {label}
        </Text>
        {info && (
          <Tooltip label={info} withArrow>
            <ActionIcon variant="subtle" size="xs" color="gray">
              <IconInfoCircle size={12} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      <Text fw={700} style={{ fontSize: '1.5rem', lineHeight: 1.2 }}>
        {value}
      </Text>

      {trend && (
        <Group gap={4} mt={4}>
          {TrendIcon && (
            <TrendIcon
              size={12}
              color={`var(--mantine-color-${trendColor}-6)`}
            />
          )}
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
