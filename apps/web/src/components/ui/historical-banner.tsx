import { Alert, Group, Text, Anchor } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

type HistoricalBannerProps = {
  year: number;
  currentYearPath: string;
};

/**
 * Banner shown when viewing a historical season.
 * Parent component should control visibility via isHistoricalYear from LeagueContext.
 */
export function HistoricalBanner({
  year,
  currentYearPath,
}: HistoricalBannerProps) {
  return (
    <Alert
      variant="light"
      color="gray"
      icon={<IconHistory size={18} />}
      py="xs"
    >
      <Group justify="space-between">
        <Text size="sm">
          You're viewing the{' '}
          <Text span fw={600}>
            {year}
          </Text>{' '}
          season.
        </Text>
        <Anchor component={Link} to={currentYearPath} size="sm">
          View current season
        </Anchor>
      </Group>
    </Alert>
  );
}
