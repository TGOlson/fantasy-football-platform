import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AppLayout } from '@/components/layouts/app-layout';
import { trpc } from '@/lib/trpc';
import {
  Title,
  Text,
  Paper,
  Stack,
  NumberInput,
  Button,
  Group,
  Divider,
  Alert,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { ScoringRules, BaseScoringValue } from '@fantasy-platform/types';

export function LeagueScoringSettingsPage() {
  const { leagueSlug, year } = useParams<{ leagueSlug: string; year: string }>();
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);
  const season = parseInt(year || new Date().getFullYear().toString());

  // Get league to find the season
  const { data: league } = trpc.leagues.getBySlug.useQuery(
    { slug: leagueSlug!, season },
    { enabled: !!leagueSlug && !!year }
  );

  const leagueSeasonId = league?.activeSeason?.id;

  const { data: scoringRules, isLoading } = trpc.scoring.getScoringRules.useQuery(
    { leagueSeasonId: leagueSeasonId! },
    { enabled: !!leagueSeasonId }
  );

  const updateMutation = trpc.scoring.updateScoringRules.useMutation({
    onSuccess: () => {
      notifications.show({
        title: 'Success',
        message: 'Scoring rules updated successfully',
        color: 'green',
      });
      setIsDirty(false);
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });

  const [localRules, setLocalRules] = useState<ScoringRules | null>(null);

  // Initialize local rules when data loads
  if (scoringRules && !localRules) {
    setLocalRules(scoringRules);
  }

  const getBaseValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value?.type === 'base') return value.value;
    if (value?.type === 'position-specific') return value.default;
    return 0;
  };

  const updateBaseValue = (
    category: 'passing' | 'rushing' | 'receiving' | 'fumbles',
    stat: string,
    newValue: number
  ) => {
    if (!localRules) return;

    const updated = { ...localRules };
    if (!updated[category]) {
      updated[category] = {};
    }

    updated[category]![stat] = { type: 'base', value: newValue } as BaseScoringValue;

    setLocalRules(updated);
    setIsDirty(true);
  };

  const updateTwoPointValue = (newValue: number) => {
    if (!localRules) return;
    setLocalRules({
      ...localRules,
      twoPointConversions: { type: 'base', value: newValue } as BaseScoringValue,
    });
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!leagueSeasonId || !localRules) return;

    updateMutation.mutate({
      leagueSeasonId,
      scoringRules: localRules,
    });
  };

  if (isLoading || !localRules) {
    return (
      <AppLayout>
        <Text c="dimmed">Loading scoring settings...</Text>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Stack gap="lg">
        <div>
          <Title order={1} mb="xs">
            Scoring Settings
          </Title>
          <Text c="dimmed">Configure how players earn points in your league</Text>
        </div>

        {isDirty && (
          <Alert color="yellow" title="Unsaved Changes">
            You have unsaved changes. Click "Save Changes" to apply them.
          </Alert>
        )}

        <Paper withBorder p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            Passing
          </Title>
          <Stack gap="sm">
            <NumberInput
              label="Yards (points per yard)"
              description="Typically 0.04 (1 point per 25 yards)"
              value={getBaseValue(localRules.passing?.yards)}
              onChange={(val) => updateBaseValue('passing', 'yards', Number(val))}
              step={0.01}
              decimalScale={2}
              min={-10}
              max={10}
            />
            <NumberInput
              label="Touchdowns (points)"
              value={getBaseValue(localRules.passing?.touchdowns)}
              onChange={(val) => updateBaseValue('passing', 'touchdowns', Number(val))}
              min={-10}
              max={20}
            />
            <NumberInput
              label="Interceptions (points)"
              description="Usually negative (e.g., -2)"
              value={getBaseValue(localRules.passing?.interceptions)}
              onChange={(val) => updateBaseValue('passing', 'interceptions', Number(val))}
              min={-10}
              max={10}
            />
          </Stack>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            Rushing
          </Title>
          <Stack gap="sm">
            <NumberInput
              label="Yards (points per yard)"
              description="Typically 0.1 (1 point per 10 yards)"
              value={getBaseValue(localRules.rushing?.yards)}
              onChange={(val) => updateBaseValue('rushing', 'yards', Number(val))}
              step={0.01}
              decimalScale={2}
              min={-10}
              max={10}
            />
            <NumberInput
              label="Touchdowns (points)"
              value={getBaseValue(localRules.rushing?.touchdowns)}
              onChange={(val) => updateBaseValue('rushing', 'touchdowns', Number(val))}
              min={-10}
              max={20}
            />
          </Stack>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            Receiving
          </Title>
          <Stack gap="sm">
            <NumberInput
              label="Receptions / PPR (points per reception)"
              description="0 = Standard, 0.5 = Half PPR, 1.0 = Full PPR"
              value={getBaseValue(localRules.receiving?.receptions)}
              onChange={(val) => updateBaseValue('receiving', 'receptions', Number(val))}
              step={0.1}
              decimalScale={1}
              min={0}
              max={5}
            />
            <NumberInput
              label="Yards (points per yard)"
              description="Typically 0.1 (1 point per 10 yards)"
              value={getBaseValue(localRules.receiving?.yards)}
              onChange={(val) => updateBaseValue('receiving', 'yards', Number(val))}
              step={0.01}
              decimalScale={2}
              min={-10}
              max={10}
            />
            <NumberInput
              label="Touchdowns (points)"
              value={getBaseValue(localRules.receiving?.touchdowns)}
              onChange={(val) => updateBaseValue('receiving', 'touchdowns', Number(val))}
              min={-10}
              max={20}
            />
          </Stack>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={3} size="h4" mb="md">
            Other
          </Title>
          <Stack gap="sm">
            <NumberInput
              label="Fumbles Lost (points)"
              description="Usually negative (e.g., -2)"
              value={getBaseValue(localRules.fumbles?.lost)}
              onChange={(val) => updateBaseValue('fumbles', 'lost', Number(val))}
              min={-10}
              max={10}
            />
            <NumberInput
              label="2-Point Conversions (points)"
              value={getBaseValue(localRules.twoPointConversions)}
              onChange={(val) => updateTwoPointValue(Number(val))}
              min={0}
              max={10}
            />
          </Stack>
        </Paper>

        <Divider />

        <Group justify="space-between">
          <Button variant="subtle" onClick={() => navigate(`/${leagueSlug}/${year}`)}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={updateMutation.isPending} disabled={!isDirty}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </AppLayout>
  );
}
