import { Badge } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

type PlayerStatus =
  | 'active'
  | 'questionable'
  | 'doubtful'
  | 'out'
  | 'ir'
  | 'bye'
  | 'suspended';

const STATUS_CONFIG: Record<
  PlayerStatus,
  { color: MantineColor; label: string }
> = {
  active: { color: 'green', label: 'Active' },
  questionable: { color: 'yellow', label: 'Q' },
  doubtful: { color: 'orange', label: 'D' },
  out: { color: 'red', label: 'O' },
  ir: { color: 'red', label: 'IR' },
  bye: { color: 'gray', label: 'BYE' },
  suspended: { color: 'red', label: 'SUSP' },
};

type StatusBadgeProps = {
  status: string;
  size?: 'xs' | 'sm' | 'md';
  showActive?: boolean;
};

export function StatusBadge({
  status,
  size = 'xs',
  showActive = false,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase() as PlayerStatus;
  const config = STATUS_CONFIG[normalizedStatus];

  // Don't render anything for active players unless explicitly requested
  if (normalizedStatus === 'active' && !showActive) {
    return null;
  }

  if (!config) {
    return null;
  }

  return (
    <Badge color={config.color} size={size} variant="filled">
      {config.label}
    </Badge>
  );
}
