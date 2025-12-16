import { Stack, Text, Group, Badge, Divider, Paper } from '@mantine/core';
import type { ScoreBreakdownItem } from '@fantasy-platform/types';

type ScoreBreakdownProps = {
  breakdown: ScoreBreakdownItem[];
  totalPoints: number;
};

export function ScoreBreakdown({ breakdown, totalPoints }: ScoreBreakdownProps) {
  return (
    <Paper p="md" withBorder radius="md" bg="gray.0">
      <Stack gap="xs">
        <Text size="sm" fw={700} c="dimmed" tt="uppercase">
          Score Breakdown
        </Text>

        {breakdown.map((item, index) => (
          <Group key={index} justify="space-between" gap="xs">
            <Group gap="xs">
              {item.isBonus && <span>🎁</span>}
              <Text size="sm">
                {item.category}
                {item.statValue !== null && (
                  <Text span c="dimmed" size="sm">
                    {' '}
                    ({item.statValue})
                  </Text>
                )}
              </Text>
            </Group>
            <Text
              size="sm"
              fw={500}
              c={item.pointValue > 0 ? 'green' : item.pointValue < 0 ? 'red' : 'dimmed'}
            >
              {item.pointValue > 0 ? '+' : ''}
              {item.pointValue.toFixed(2)}
            </Text>
          </Group>
        ))}

        <Divider my="xs" />

        <Group justify="space-between">
          <Text fw={700}>Total Fantasy Points</Text>
          <Badge size="lg" variant="filled" color="violet">
            {totalPoints.toFixed(2)} pts
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );
}
