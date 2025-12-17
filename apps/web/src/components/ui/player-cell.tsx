import { Group, Avatar, Stack, Text } from '@mantine/core';
import { PositionBadge } from './position-badge';
import { StatusBadge } from './status-badge';

type PlayerCellProps = {
  name: string;
  position: string;
  team: string;
  status?: string;
  imageUrl?: string;
  subtitle?: string;
};

export function PlayerCell({
  name,
  position,
  team,
  status,
  imageUrl,
  subtitle,
}: PlayerCellProps) {
  // Generate initials for avatar fallback
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Group gap="sm" wrap="nowrap">
      <Avatar src={imageUrl} size="sm" radius="xl" color="violet">
        {initials}
      </Avatar>
      <Stack gap={2}>
        <Group gap="xs" wrap="nowrap">
          <Text size="sm" fw={500} lineClamp={1}>
            {name}
          </Text>
          {status && <StatusBadge status={status} />}
        </Group>
        <Group gap="xs">
          <PositionBadge position={position} size="xs" />
          <Text size="xs" c="dimmed">
            {team}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed">
              {subtitle}
            </Text>
          )}
        </Group>
      </Stack>
    </Group>
  );
}
