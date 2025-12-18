import { Paper, Group, Text, Anchor, ThemeIcon } from '@mantine/core';
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
    <Paper
      p="sm"
      withBorder
      style={{
        backgroundColor: '#fef3c7',
        borderColor: '#fcd34d',
      }}
    >
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon size="sm" variant="light" color="yellow" radius="xl">
            <IconHistory size={14} />
          </ThemeIcon>
          <Text size="sm" c="dark">
            You're viewing the{' '}
            <Text span fw={700}>
              {year}
            </Text>{' '}
            season.
          </Text>
        </Group>
        <Anchor
          component={Link}
          to={currentYearPath}
          size="sm"
          fw={600}
          c="dark"
          style={{ textDecoration: 'underline' }}
        >
          View current season
        </Anchor>
      </Group>
    </Paper>
  );
}
