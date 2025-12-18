import { Badge } from '@mantine/core';

type PlayerStatus =
  | 'active'
  | 'questionable'
  | 'doubtful'
  | 'out'
  | 'ir'
  | 'bye'
  | 'suspended';

// Using semantic colors with good contrast
const STATUS_CONFIG: Record<
  PlayerStatus,
  { bg: string; color: string; label: string }
> = {
  active: { bg: '#dcfce7', color: '#166534', label: 'Active' },
  questionable: { bg: '#fef3c7', color: '#92400e', label: 'Q' },
  doubtful: { bg: '#ffedd5', color: '#9a3412', label: 'D' },
  out: { bg: '#fee2e2', color: '#991b1b', label: 'O' },
  ir: { bg: '#fee2e2', color: '#991b1b', label: 'IR' },
  bye: { bg: '#f3f4f6', color: '#4b5563', label: 'BYE' },
  suspended: { bg: '#fee2e2', color: '#991b1b', label: 'SUSP' },
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
    <Badge
      size={size}
      variant="filled"
      styles={{
        root: {
          backgroundColor: config.bg,
          color: config.color,
          fontWeight: 700,
        },
      }}
    >
      {config.label}
    </Badge>
  );
}
