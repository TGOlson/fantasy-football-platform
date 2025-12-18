import { Group, Avatar, Stack, Text } from '@mantine/core';
import { PositionBadge } from './position-badge';
import { StatusBadge } from './status-badge';

type PlayerCellProps = {
  name: string;
  position: string;
  team: string;
  status?: string;
  imageUrl?: string;
};

export function PlayerCell({
  name,
  position,
  team,
  status,
  imageUrl,
}: PlayerCellProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Group gap="xs" wrap="nowrap">
      <Avatar src={imageUrl} size="sm" radius="xl" color="gray.3">
        {initials}
      </Avatar>
      <Stack gap={0}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" fw={500} lineClamp={1}>
            {name}
          </Text>
          {status && <StatusBadge status={status} />}
        </Group>
        <Group gap={6}>
          <PositionBadge position={position} />
          <Text size="xs" c="dimmed">
            {team}
          </Text>
        </Group>
      </Stack>
    </Group>
  );
}
