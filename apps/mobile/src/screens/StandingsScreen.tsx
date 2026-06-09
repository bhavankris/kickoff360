import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GROUPS, standingsFor, teamFor, useMatches } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { Card, Flag, LiveDot, Pill, SectionTitle } from '../components/ui';
import { MatchRow } from '../components/matchui';
import { HeaderGradient } from '../components/HeaderGradient';

export function StandingsScreen() {
  const { t } = useTheme();
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

  const yellow = '#ffcf2e';
  const red = '#ff6b6f';
  const colWidths = { stat: 24, pts: 30 };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingBottom: 14,
          }}
        >
          <Text style={{ fontSize: 27, color: t.text, letterSpacing: -0.6, ...f(800) }}>Group Stage</Text>
          <Pill fs={10} bg={t.surface} color={t.muted} borderColor={t.line}>
            12 GROUPS
          </Pill>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingHorizontal: 20 }}>
          {groups.map((g) => {
            const active = grp === g;
            const mine = myGroup === g;
            return (
              <Pressable
                key={g}
                onPress={() => setGrp(g)}
                style={{
                  minWidth: 44,
                  height: 44,
                  borderRadius: 13,
                  backgroundColor: active ? t.brand : t.surface,
                  borderWidth: 1,
                  borderColor: active ? t.brand : t.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: active ? t.brandInk : t.muted, fontSize: 15, ...f(800) }}>{g}</Text>
                {mine ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 6,
                      width: 5,
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: active ? t.brandInk : t.brandText,
                    }}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
      </HeaderGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 8 }}>
          {/* header row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 11,
              paddingBottom: 9,
              paddingHorizontal: 12,
              borderBottomWidth: 1,
              borderBottomColor: t.line,
            }}
          >
            <View style={{ width: 22 }} />
            <Text style={{ flex: 1, fontSize: 10, color: t.faint, letterSpacing: 0.5, ...mono(700) }}>
              GROUP {grp}
            </Text>
            {['P', 'W', 'D', 'L', 'GD', 'PTS'].map((l) => (
              <Text
                key={l}
                style={{
                  width: l === 'PTS' ? colWidths.pts : colWidths.stat,
                  textAlign: 'center',
                  fontSize: 10,
                  color: t.faint,
                  ...mono(700),
                }}
              >
                {l}
              </Text>
            ))}
          </View>
          {table.map((r, i) => {
            const mine = r.code === team;
            const bar = i < 2 ? t.win : i === 2 ? yellow : 'transparent';
            return (
              <View
                key={r.code}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderBottomWidth: i < 3 ? 1 : 0,
                  borderBottomColor: t.line,
                  backgroundColor: mine ? t.brandSoft : 'transparent',
                }}
              >
                <View
                  style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: 3, backgroundColor: bar }}
                />
                <Text style={{ width: 22, fontSize: 13, color: i < 2 ? t.text : t.faint, ...mono(700) }}>{i + 1}</Text>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <Flag code={r.code} size={24} />
                  <Text numberOfLines={1} style={{ fontSize: 13.5, color: t.text, ...f(mine ? 800 : 700) }}>
                    {r.code}
                  </Text>
                  {r.live ? <LiveDot size={5} /> : null}
                </View>
                {[r.P, r.W, r.D, r.L].map((val, k) => (
                  <Text
                    key={k}
                    style={{
                      width: colWidths.stat,
                      textAlign: 'center',
                      fontSize: 12.5,
                      color: t.muted,
                      fontVariant: ['tabular-nums'],
                      ...f(600),
                    }}
                  >
                    {val}
                  </Text>
                ))}
                <Text
                  style={{
                    width: colWidths.stat,
                    textAlign: 'center',
                    fontSize: 12.5,
                    color: r.GD > 0 ? t.win : r.GD < 0 ? red : t.muted,
                    fontVariant: ['tabular-nums'],
                    ...f(700),
                  }}
                >
                  {r.GD > 0 ? '+' : ''}
                  {r.GD}
                </Text>
                <Text
                  style={{
                    width: colWidths.pts,
                    textAlign: 'center',
                    fontSize: 15,
                    color: t.text,
                    fontVariant: ['tabular-nums'],
                    ...f(800),
                  }}
                >
                  {r.Pts}
                </Text>
              </View>
            );
          })}
        </Card>
        <View style={{ flexDirection: 'row', gap: 16, paddingTop: 4, paddingHorizontal: 4, paddingBottom: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: t.win }} />
            <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>Round of 32</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 9, height: 9, borderRadius: 2, backgroundColor: yellow }} />
            <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>Best 3rd</Text>
          </View>
        </View>

        <SectionTitle>Group {grp} Fixtures</SectionTitle>
        <View style={{ gap: 9 }}>
          {fixtures.map((m) => (
            <MatchRow key={m.matchId} match={m} onOpen={(id) => router.push(`/match/${id}`)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
