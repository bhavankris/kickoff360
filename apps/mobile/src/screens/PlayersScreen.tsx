import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cleanSheets, teamFor, useMatches, useScorers } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
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
    <View className="flex-1 bg-canvas">
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 14 }}>
        <Text className="mb-3.5 font-archivo-extrabold text-[27px] tracking-[-0.6px] text-ink">
          Top Players
        </Text>
        <View className="flex-row gap-1.5 rounded-[13px] border border-line bg-surface p-1">
          {(Object.keys(MODES) as Mode[]).map((id) => (
            <Pressable
              key={id}
              onPress={() => setMode(id)}
              className={`flex-1 items-center rounded-[9px] py-[9px] ${
                mode === id ? 'bg-brand' : 'bg-transparent'
              }`}
            >
              <Text
                numberOfLines={1}
                className={`font-archivo-extrabold text-[12.5px] ${mode === id ? 'text-brand-ink' : 'text-muted'}`}
              >
                {MODES[id].tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </HeaderGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
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
              <View className="absolute -right-5 -top-10 h-[150px] w-[150px] rounded-full bg-brand opacity-[0.18]" />
              <View className="flex-row items-center gap-4">
                <View>
                  <View className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-2 border-brand-line bg-surface2">
                    <Icon name={mode === 'cleansheets' ? 'shirt' : 'user'} size={40} color={t.faint} />
                  </View>
                  <View className="absolute -bottom-[3px] -right-[3px] overflow-hidden rounded-[7px] border-2 border-canvas">
                    <Flag code={leader.team} size={26} radius={6} />
                  </View>
                </View>
                <View className="min-w-0 flex-1">
                  <Pill className="bg-brand" textClassName="text-brand-ink" fs={10} icon={<Icon name="trophy" size={11} color={t.brandInk} />}>
                    {cfg.rankLabel}
                  </Pill>
                  <Text className="mb-px mt-2 font-archivo-extrabold text-[22px] tracking-[-0.4px] text-ink">
                    {leader.player}
                  </Text>
                  <Text className="font-archivo text-[12.5px] text-muted">{teamFor(leader.team)?.name}</Text>
                </View>
                <View className="items-center">
                  <Text className="font-archivo-extrabold text-[46px] leading-[48px] text-brand-text">{leader.stat}</Text>
                  <Text className="font-mono-bold text-[10px] tracking-[0.5px] text-faint">{cfg.unit}</Text>
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
                    className={`flex-row items-center gap-3 rounded-xl px-2.5 py-[11px] ${
                      mine ? 'bg-brand-soft' : 'bg-transparent'
                    }`}
                  >
                    <Text className="w-5 text-center font-mono-bold text-[13px] text-faint">
                      {i + 2}
                    </Text>
                    <Flag code={p.team} size={30} />
                    <View className="min-w-0 flex-1">
                      <Text numberOfLines={1} className="font-archivo-bold text-[14px] text-ink">
                        {p.player}
                      </Text>
                      <Text className="font-archivo text-[11px] text-faint">{teamFor(p.team)?.name}</Text>
                    </View>
                    <View className="flex-row items-center gap-3.5">
                      <Text className="font-mono text-[11px] text-faint">{p.sub}</Text>
                      <Text
                        className="w-6 text-right font-archivo-extrabold text-[20px] text-ink"
                        style={{ fontVariant: ['tabular-nums'] }}
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
          <Text className="mt-10 text-center font-archivo text-[14px] text-faint">
            Leaderboards appear once the tournament data is in.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
