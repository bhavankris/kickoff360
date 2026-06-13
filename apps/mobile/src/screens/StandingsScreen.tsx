import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GROUPS, standingsFor, teamFor, useMatches } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { Card, Flag, LiveDot, Pill, SectionTitle } from '../components/ui';
import { MatchRow } from '../components/matchui';
import { HeaderGradient } from '../components/HeaderGradient';

export function StandingsScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: matches = [] } = useMatches();

  const team = profile?.countryCode ?? 'BRA';
  const myGroup = teamFor(team)?.group ?? 'A';
  const groups = Object.keys(GROUPS);
  const [grp, setGrp] = useState(myGroup);

  const table = useMemo(() => standingsFor(matches, grp), [matches, grp]);
  const fixtures = useMemo(
    () => matches.filter((m) => m.group === grp).sort((a, b) => a.kickoff.toMillis() - b.kickoff.toMillis()),
    [matches, grp],
  );

  const colWidths = { stat: 24, pts: 30 };

  return (
    <View className="flex-1 bg-canvas">
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingBottom: 12 }}>
        <View className="flex-row items-center justify-between px-5 pb-3.5">
          <Text className="font-archivo-extrabold text-[27px] tracking-[-0.6px] text-ink">Group Stage</Text>
          <Pill fs={10} className="border border-line bg-surface" textClassName="text-muted">
            12 GROUPS
          </Pill>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-[7px] px-5">
          {groups.map((g) => {
            const active = grp === g;
            const mine = myGroup === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGrp(g)}
                className={`h-11 min-w-11 items-center justify-center rounded-[13px] border ${
                  active ? 'border-brand bg-brand' : 'border-line bg-surface'
                }`}
              >
                <Text className={`font-archivo-extrabold text-[15px] ${active ? 'text-brand-ink' : 'text-muted'}`}>
                  {g}
                </Text>
                {mine ? (
                  <View
                    className={`absolute right-1.5 top-[5px] h-[5px] w-[5px] rounded-[3px] ${
                      active ? 'bg-brand-ink' : 'bg-brand-text'
                    }`}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </HeaderGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 8 }}>
          {/* header row */}
          <View className="flex-row items-center border-b border-b-line px-3 pb-[9px] pt-[11px]">
            <View className="w-[22px]" />
            <Text className="flex-1 font-mono-bold text-[10px] tracking-[0.5px] text-faint">
              GROUP {grp}
            </Text>
            {['P', 'W', 'D', 'L', 'GD', 'PTS'].map((l) => (
              <Text
                key={l}
                className="text-center font-mono-bold text-[10px] text-faint"
                style={{ width: l === 'PTS' ? colWidths.pts : colWidths.stat }}
              >
                {l}
              </Text>
            ))}
          </View>
          {table.map((r, i) => {
            const mine = r.code === team;
            return (
              <View
                key={r.code}
                className={`flex-row items-center px-3 py-2.5 ${i < 3 ? 'border-b border-b-line' : ''} ${
                  mine ? 'bg-brand-soft' : 'bg-transparent'
                }`}
              >
                <View
                  className={`absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-[3px] ${
                    i < 2 ? 'bg-win' : i === 2 ? 'bg-[#ffcf2e]' : 'bg-transparent'
                  }`}
                />
                <Text className={`w-[22px] font-mono-bold text-[13px] ${i < 2 ? 'text-ink' : 'text-faint'}`}>
                  {i + 1}
                </Text>
                <View className="min-w-0 flex-1 flex-row items-center gap-[9px]">
                  <Flag code={r.code} size={24} />
                  <Text
                    numberOfLines={1}
                    className={`text-[13.5px] text-ink ${mine ? 'font-archivo-extrabold' : 'font-archivo-bold'}`}
                  >
                    {r.code}
                  </Text>
                  {r.live ? <LiveDot size={5} /> : null}
                </View>
                {[r.P, r.W, r.D, r.L].map((val, k) => (
                  <Text
                    key={k}
                    className="text-center font-archivo-semibold text-[12.5px] text-muted"
                    style={{ width: colWidths.stat, fontVariant: ['tabular-nums'] }}
                  >
                    {val}
                  </Text>
                ))}
                <Text
                  className={`text-center font-archivo-bold text-[12.5px] ${
                    r.GD > 0 ? 'text-win' : r.GD < 0 ? 'text-[#ff6b6f]' : 'text-muted'
                  }`}
                  style={{ width: colWidths.stat, fontVariant: ['tabular-nums'] }}
                >
                  {r.GD > 0 ? '+' : ''}
                  {r.GD}
                </Text>
                <Text
                  className="text-center font-archivo-extrabold text-[15px] text-ink"
                  style={{ width: colWidths.pts, fontVariant: ['tabular-nums'] }}
                >
                  {r.Pts}
                </Text>
              </View>
            );
          })}
        </Card>
        <View className="flex-row gap-4 px-1 pb-[18px] pt-1">
          <View className="flex-row items-center gap-1.5">
            <View className="h-[9px] w-[9px] rounded-[2px] bg-win" />
            <Text className="font-archivo text-[11px] text-faint">Round of 32</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-[9px] w-[9px] rounded-[2px] bg-[#ffcf2e]" />
            <Text className="font-archivo text-[11px] text-faint">Best 3rd</Text>
          </View>
        </View>

        <SectionTitle>Group {grp} Fixtures</SectionTitle>
        <View className="gap-[9px]">
          {fixtures.map((m) => (
            <MatchRow key={m.matchId} match={m} onOpen={(id) => router.push(`/match/${id}`)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
