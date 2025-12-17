import { Badge } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

const POSITION_COLORS: Record<string, MantineColor> = {
  QB: 'violet',
  RB: 'blue',
  WR: 'green',
  TE: 'orange',
  K: 'gray',
  DEF: 'red',
  FLEX: 'cyan',
  SUPERFLEX: 'pink',
};

type PositionBadgeProps = {
  position: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
};

export function PositionBadge({ position, size = 'sm' }: PositionBadgeProps) {
  const color = POSITION_COLORS[position] || 'gray';

  return (
    <Badge color={color} size={size} variant="light">
      {position}
    </Badge>
  );
}
