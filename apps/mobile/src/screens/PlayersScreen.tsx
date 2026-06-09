import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cleanSheets, teamFor, useMatches, useScorers } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { Card, Flag, Icon, Pill, SectionTitle } from '../components/ui';
import { HeaderGradient } from '../components/HeaderGradient';

type Mode = 'goals' | 'assists' | 'cleansheets';

const MODES: Record<Mode, { tab: string; unit: string; rankLabel: string; chart: string }> = {
  goals:       { tab: 'Golden Boot',  unit: 'GOALS',        rankLabel: '#1 SCORER',    chart: 'Scoring Chart' },
  assists:     { tab: 'Top Assists',  unit: 'ASSISTS',      rankLabel: '#1 PLAYMAKER', chart: 'Assist Chart' },
  cleansheets: { tab: 'Golden Glove', unit: 'CLEAN SHEETS', rankLabel: '#1 KEEPER',    chart: 'Clean Sheet Chart' },
};

interface Row {
  player: string;
  team: string;
  stat: number;
  sub: string;
}

export function PlayersScreen() {
  const { t } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('goals');
  const { data: scorers = [] } = useScorers();
  const { data: matches = [] } = useMatches();
  const cfg = MODES[mode];
  const myTeam = profile?.countryCode ?? '';

  const list: Row[] = useMemo(() => {
    if (mode === 'cleansheets') {
      // Golden Glove is derived from completed results, not a polled collection.
      return cleanSheets(matches).map((k) => ({
        player: k.player,
        team: k.team,
        stat: k.cs,
        sub: `${k.played} ${k.played === 1 ? 'game' : 'games'} · ${k.ga} GA`,
      }));
    }
    const pool =
      mode === 'assists'
        ? [...scorers].sort((a, b) => b.assists - a.assists || b.goals - a.goals)
        : scorers;
    return pool.map((p) => ({
      player: p.player,
      team: p.team,
      stat: mode === 'assists' ? p.assists : p.goals,
      sub: `${p.goals}G ${p.assists}A`,
    }));
  }, [mode, scorers, matches]);

  const leader = list[0];

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text style={{ fontSize: 27, color: t.text, marginBottom: 14, letterSpacing: -0.6, ...f(800) }}>
          Top Players
        </Text>
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            backgroundColor: t.surface,
            borderRadius: 13,
            padding: 4,
            borderWidth: 1,
            borderColor: t.line,
          }}
        >
          {(Object.keys(MODES) as Mode[]).map((id) => (
            <Pressable
              key={id}
              onPress={() => setMode(id)}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 9,
                backgroundColor: mode === id ? t.brand : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text numberOfLines={1} style={{ color: mode === id ? t.brandInk : t.muted, fontSize: 12.5, ...f(800) }}>
                {MODES[id].tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </HeaderGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {leader ? (
          <>
            {/* leader card */}
            <HeaderGradient
              style={{
                borderRadius: 22,
                padding: 20,
                marginBottom: 18,
                borderWidth: 1,
                borderColor: t.brandLine,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: -40,
                  right: -20,
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  backgroundColor: t.brand,
                  opacity: 0.18,
                }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <View>
                  <View
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 38,
                      backgroundColor: t.surface2,
                      borderWidth: 2,
                      borderColor: t.brandLine,
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <Icon name={mode === 'cleansheets' ? 'shirt' : 'user'} size={40} color={t.faint} />
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: -3,
                      right: -3,
                      borderWidth: 2,
                      borderColor: t.bg,
                      borderRadius: 7,
                      overflow: 'hidden',
                    }}
                  >
                    <Flag code={leader.team} size={26} radius={6} />
                  </View>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Pill bg={t.brand} color={t.brandInk} fs={10} icon={<Icon name="trophy" size={11} color={t.brandInk} />}>
                    {cfg.rankLabel}
                  </Pill>
                  <Text style={{ fontSize: 22, color: t.text, marginTop: 8, marginBottom: 1, letterSpacing: -0.4, ...f(800) }}>
                    {leader.player}
                  </Text>
                  <Text style={{ fontSize: 12.5, color: t.muted, ...f(400) }}>{teamFor(leader.team)?.name}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 46, lineHeight: 48, color: t.brandText, ...f(800) }}>{leader.stat}</Text>
                  <Text style={{ fontSize: 10, color: t.faint, letterSpacing: 0.5, ...mono(700) }}>{cfg.unit}</Text>
                </View>
              </View>
            </HeaderGradient>

            <SectionTitle>{cfg.chart}</SectionTitle>
            <Card pad={6}>
              {list.slice(1).map((p, i) => {
                const mine = p.team === myTeam;
                return (
                  <View
                    key={p.player + p.team}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 11,
                      paddingHorizontal: 10,
                      borderRadius: 12,
                      backgroundColor: mine ? t.brandSoft : 'transparent',
                    }}
                  >
                    <Text style={{ width: 20, fontSize: 13, color: t.faint, textAlign: 'center', ...mono(700) }}>
                      {i + 2}
                    </Text>
                    <Flag code={p.team} size={30} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text numberOfLines={1} style={{ fontSize: 14, color: t.text, ...f(700) }}>
                        {p.player}
                      </Text>
                      <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>{teamFor(p.team)?.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      <Text style={{ fontSize: 11, color: t.faint, ...mono(400) }}>{p.sub}</Text>
                      <Text
                        style={{
                          fontSize: 20,
                          color: t.text,
                          width: 24,
                          textAlign: 'right',
                          fontVariant: ['tabular-nums'],
                          ...f(800),
                        }}
                      >
                        {p.stat}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        ) : (
          <Text style={{ textAlign: 'center', color: t.faint, marginTop: 40, fontSize: 14, ...f(400) }}>
            Leaderboards appear once the tournament data is in.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
