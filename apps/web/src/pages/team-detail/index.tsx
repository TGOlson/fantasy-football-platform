import { useLoaderData, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layouts/app-layout';
import { useLeague } from '@/providers/league-provider';
import { Text, Box, Stack, Group, UnstyledButton } from '@mantine/core';
import { loader } from './loader';
import { useState } from 'react';
import { trpcClient } from '@/lib/trpc-client';
import { useQuery } from '@tanstack/react-query';

export function TeamDetailPage() {
  const { team, franchise, leagueSeason, settings, standings } =
    useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const { leagueSlug, year } = useParams<{
    leagueSlug: string;
    year: string;
  }>();
  const { league } = useLeague();
  const [currentWeek, setCurrentWeek] = useState(1);

  const { data: lineup } = useQuery({
    queryKey: ['lineup', franchise.id, currentWeek, parseInt(year!)],
    queryFn: () =>
      trpcClient.lineups.getByFranchiseWeek.query({
        franchiseId: franchise.id,
        weekNumber: currentWeek,
        season: parseInt(year!),
      }),
  });

  const { data: currentMatchup } = useQuery({
    queryKey: ['currentMatchup', team.id, currentWeek],
    queryFn: () =>
      trpcClient.teams.getCurrentMatchup.query({
        teamId: team.id,
        weekNumber: currentWeek,
      }),
  });

  const wins = team.wins || 0;
  const losses = team.losses || 0;
  const ties = team.ties || 0;
  const teamStanding = standings?.find((s) => s.teamId === team.id);
  const rank = teamStanding?.rank || 0;

  const starterSlotCount =
    settings.rosterSlots?.filter((slot) => slot.type !== 'bench').length || 0;
  const starters =
    lineup?.filter((p) => p.rosterSlotIndex < starterSlotCount) || [];
  const bench =
    lineup?.filter((p) => p.rosterSlotIndex >= starterSlotCount) || [];

  const weekTotal = lineup?.reduce(
    (sum, p) => sum + parseFloat(p.pointsScored || '0'),
    0
  );

  const isWinning = currentMatchup
    ? (currentMatchup.homeTeamId === team.id &&
        parseFloat(currentMatchup.homeScore || '0') >
          parseFloat(currentMatchup.awayScore || '0')) ||
      (currentMatchup.awayTeamId === team.id &&
        parseFloat(currentMatchup.awayScore || '0') >
          parseFloat(currentMatchup.homeScore || '0'))
    : false;

  return (
    <AppLayout>
      <Box
        style={{
          fontFamily: '"JetBrains Mono", "IBM Plex Mono", monospace',
          background: '#fafafa',
          minHeight: '100vh',
          margin: -16,
          padding: 20,
        }}
      >
        {/* HEADER */}
        <Box
          mb={16}
          pb={12}
          style={{
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Group justify="space-between" mb={8}>
            <Text
              size="xs"
              style={{
                color: '#6b7280',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontSize: 10,
              }}
            >
              {league.name} / {year} / TEAM VIEW
            </Text>
            <Group gap={6}>
              <Box
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: '#10b981',
                  boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)',
                }}
              />
              <Text size="xs" style={{ color: '#6b7280', fontSize: 10 }}>
                LIVE
              </Text>
            </Group>
          </Group>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: '#111827',
              letterSpacing: '-0.01em',
            }}
          >
            {franchise.name}
          </Text>
        </Box>

        {/* METRICS */}
        <Group
          gap={0}
          mb={16}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRight: '1px solid #e0e0e0',
              background: '#ffffff',
            }}
          >
            <Text
              size="xs"
              mb={3}
              style={{
                color: '#6b7280',
                letterSpacing: '0.04em',
                fontSize: 9,
              }}
            >
              RECORD
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: wins > losses ? '#059669' : '#dc2626',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {wins}-{losses}
              {ties > 0 && `-${ties}`}
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRight: '1px solid #e0e0e0',
              background: '#ffffff',
            }}
          >
            <Text
              size="xs"
              mb={3}
              style={{
                color: '#6b7280',
                letterSpacing: '0.04em',
                fontSize: 9,
              }}
            >
              RANK
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#0891b2',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              #{rank.toString().padStart(2, '0')}
              <Text
                component="span"
                size="xs"
                ml={4}
                style={{ color: '#9ca3af', fontSize: 11 }}
              >
                / {standings?.length || 0}
              </Text>
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRight: '1px solid #e0e0e0',
              background: '#ffffff',
            }}
          >
            <Text
              size="xs"
              mb={3}
              style={{
                color: '#6b7280',
                letterSpacing: '0.04em',
                fontSize: 9,
              }}
            >
              PF
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#111827',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {parseFloat(team.pointsFor || '0').toFixed(2)}
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              padding: '10px 12px',
              background: '#ffffff',
            }}
          >
            <Text
              size="xs"
              mb={3}
              style={{
                color: '#6b7280',
                letterSpacing: '0.04em',
                fontSize: 9,
              }}
            >
              PA
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#111827',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {parseFloat(team.pointsAgainst || '0').toFixed(2)}
            </Text>
          </Box>
        </Group>

        {/* MATCHUP */}
        {currentMatchup && (
          <Box
            mb={16}
            p={16}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: 3,
              background: '#ffffff',
            }}
          >
            <Group justify="space-between" mb={12}>
              <Text
                size="xs"
                style={{
                  color: '#6b7280',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                WEEK {currentWeek} MATCHUP
                {currentMatchup.completedAt && (
                  <Text
                    component="span"
                    ml={6}
                    style={{
                      color: '#059669',
                      fontSize: 9,
                    }}
                  >
                    [FINAL]
                  </Text>
                )}
              </Text>
              <Group gap={6}>
                <UnstyledButton
                  onClick={() => setCurrentWeek((w) => Math.max(1, w - 1))}
                  disabled={currentWeek === 1}
                  style={{
                    padding: '3px 10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    color: currentWeek === 1 ? '#9ca3af' : '#0891b2',
                    fontSize: 9,
                    cursor: currentWeek === 1 ? 'default' : 'pointer',
                    background: '#ffffff',
                  }}
                >
                  ← PREV
                </UnstyledButton>
                <UnstyledButton
                  onClick={() => setCurrentWeek((w) => Math.min(18, w + 1))}
                  disabled={currentWeek === 18}
                  style={{
                    padding: '3px 10px',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    color: currentWeek === 18 ? '#9ca3af' : '#0891b2',
                    fontSize: 9,
                    cursor: currentWeek === 18 ? 'default' : 'pointer',
                    background: '#ffffff',
                  }}
                >
                  NEXT →
                </UnstyledButton>
              </Group>
            </Group>

            <Group gap={24} align="center">
              <Box style={{ flex: 1 }}>
                <Text
                  mb={6}
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {currentMatchup.homeTeamId === team.id
                    ? franchise.name
                    : 'OPPONENT'}
                </Text>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color:
                      currentMatchup.homeTeamId === team.id && isWinning
                        ? '#059669'
                        : currentMatchup.homeTeamId !== team.id && !isWinning
                          ? '#dc2626'
                          : '#111827',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {parseFloat(currentMatchup.homeScore || '0').toFixed(2)}
                </Text>
              </Box>

              <Text
                style={{
                  fontSize: 14,
                  color: '#d1d5db',
                  fontWeight: 700,
                }}
              >
                VS
              </Text>

              <Box style={{ flex: 1, textAlign: 'right' }}>
                <Text
                  mb={6}
                  style={{
                    fontSize: 11,
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                  }}
                >
                  {currentMatchup.awayTeamId === team.id
                    ? franchise.name
                    : 'OPPONENT'}
                </Text>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color:
                      currentMatchup.awayTeamId === team.id && isWinning
                        ? '#059669'
                        : currentMatchup.awayTeamId !== team.id && !isWinning
                          ? '#dc2626'
                          : '#111827',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}
                >
                  {parseFloat(currentMatchup.awayScore || '0').toFixed(2)}
                </Text>
              </Box>
            </Group>
          </Box>
        )}

        {/* ROSTER */}
        <Box
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 3,
            background: '#ffffff',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            px={16}
            py={10}
            style={{
              borderBottom: '1px solid #e0e0e0',
              background: '#f9fafb',
            }}
          >
            <Group justify="space-between">
              <Text
                size="xs"
                style={{
                  color: '#6b7280',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                WEEK {currentWeek} ROSTER
              </Text>
              {weekTotal !== undefined && (
                <Text
                  size="xs"
                  style={{
                    color: '#0891b2',
                    fontVariantNumeric: 'tabular-nums',
                    fontSize: 11,
                  }}
                >
                  TOTAL: {weekTotal.toFixed(2)}
                </Text>
              )}
            </Group>
          </Box>

          {/* Column Headers */}
          <Box
            px={16}
            py={6}
            style={{
              borderBottom: '1px solid #e0e0e0',
              background: '#f9fafb',
            }}
          >
            <Group gap={0}>
              <Text
                size="xs"
                style={{
                  width: 50,
                  color: '#9ca3af',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                SLOT
              </Text>
              <Text
                size="xs"
                style={{
                  flex: 1,
                  color: '#9ca3af',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                PLAYER
              </Text>
              <Text
                size="xs"
                style={{
                  width: 50,
                  color: '#9ca3af',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                POS
              </Text>
              <Text
                size="xs"
                style={{
                  width: 70,
                  textAlign: 'right',
                  color: '#9ca3af',
                  letterSpacing: '0.04em',
                  fontSize: 9,
                }}
              >
                POINTS
              </Text>
            </Group>
          </Box>

          {/* Starters */}
          {starters.length > 0 && (
            <Box>
              <Box
                px={16}
                py={5}
                style={{
                  background: '#f0fdf4',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Text
                  size="xs"
                  style={{
                    color: '#059669',
                    letterSpacing: '0.04em',
                    fontSize: 9,
                  }}
                >
                  ▸ STARTERS
                </Text>
              </Box>
              <Stack gap={0}>
                {starters.map((player, idx) => {
                  const slot = settings.rosterSlots?.[player.rosterSlotIndex];
                  const slotLabel =
                    slot?.type === 'starter'
                      ? slot.positions.join('/')
                      : 'FLEX';
                  const points = parseFloat(player.pointsScored || '0');

                  return (
                    <Box
                      key={player.id}
                      px={16}
                      py={9}
                      style={{
                        borderBottom:
                          idx < starters.length - 1
                            ? '1px solid #f3f4f6'
                            : '1px solid #e0e0e0',
                        background:
                          points >= 20
                            ? '#f0fdf4'
                            : points >= 15
                              ? '#fafafa'
                              : '#ffffff',
                        transition: 'background 0.1s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          points >= 20
                            ? '#f0fdf4'
                            : points >= 15
                              ? '#fafafa'
                              : '#ffffff';
                      }}
                    >
                      <Group gap={0}>
                        <Text
                          size="xs"
                          style={{
                            width: 50,
                            color: '#0891b2',
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {slotLabel}
                        </Text>
                        <Box style={{ flex: 1 }}>
                          <Text
                            size="xs"
                            style={{
                              color: '#111827',
                              marginBottom: 1,
                              fontSize: 12,
                            }}
                          >
                            {player.playerName}
                          </Text>
                          <Text
                            size="xs"
                            style={{
                              color: '#9ca3af',
                              fontSize: 10,
                            }}
                          >
                            {player.nflTeam} · {player.position}
                          </Text>
                        </Box>
                        <Text
                          size="xs"
                          style={{
                            width: 50,
                            color: '#6b7280',
                            fontSize: 11,
                          }}
                        >
                          {player.position}
                        </Text>
                        <Text
                          style={{
                            width: 70,
                            textAlign: 'right',
                            fontSize: 14,
                            fontWeight: 600,
                            color:
                              points >= 20
                                ? '#059669'
                                : points >= 15
                                  ? '#0891b2'
                                  : points >= 10
                                    ? '#111827'
                                    : '#9ca3af',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {points.toFixed(1)}
                        </Text>
                      </Group>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {/* Bench */}
          {bench.length > 0 && (
            <Box>
              <Box
                px={16}
                py={5}
                style={{
                  background: '#f9fafb',
                  borderBottom: '1px solid #e0e0e0',
                }}
              >
                <Text
                  size="xs"
                  style={{
                    color: '#6b7280',
                    letterSpacing: '0.04em',
                    fontSize: 9,
                  }}
                >
                  ▸ BENCH ({bench.length})
                </Text>
              </Box>
              <Stack gap={0}>
                {bench.map((player, idx) => {
                  const points = parseFloat(player.pointsScored || '0');

                  return (
                    <Box
                      key={player.id}
                      px={16}
                      py={8}
                      style={{
                        borderBottom:
                          idx < bench.length - 1 ? '1px solid #f3f4f6' : 'none',
                        opacity: 0.65,
                      }}
                    >
                      <Group gap={0}>
                        <Text
                          size="xs"
                          style={{
                            width: 50,
                            color: '#9ca3af',
                            fontSize: 11,
                          }}
                        >
                          BN
                        </Text>
                        <Box style={{ flex: 1 }}>
                          <Text
                            size="xs"
                            style={{
                              color: '#111827',
                              marginBottom: 1,
                              fontSize: 12,
                            }}
                          >
                            {player.playerName}
                          </Text>
                          <Text
                            size="xs"
                            style={{
                              color: '#9ca3af',
                              fontSize: 10,
                            }}
                          >
                            {player.nflTeam} · {player.position}
                          </Text>
                        </Box>
                        <Text
                          size="xs"
                          style={{
                            width: 50,
                            color: '#9ca3af',
                            fontSize: 11,
                          }}
                        >
                          {player.position}
                        </Text>
                        <Text
                          style={{
                            width: 70,
                            textAlign: 'right',
                            fontSize: 13,
                            fontWeight: 600,
                            color: '#9ca3af',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {points.toFixed(1)}
                        </Text>
                      </Group>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {(!lineup || lineup.length === 0) && (
            <Box p={24} ta="center">
              <Text style={{ color: '#9ca3af', fontSize: 11 }}>
                NO ROSTER DATA / WEEK {currentWeek}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </AppLayout>
  );
}
