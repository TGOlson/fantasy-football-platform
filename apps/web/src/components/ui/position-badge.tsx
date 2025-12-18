import { Text } from '@mantine/core';

type PositionBadgeProps = {
  position: string;
};

export function PositionBadge({ position }: PositionBadgeProps) {
  return (
    <Text
      size="xs"
      fw={600}
      c="dimmed"
      style={{
        fontFamily: 'var(--mantine-font-family-monospace)',
        letterSpacing: '0.02em',
      }}
    >
      {position}
    </Text>
  );
}
