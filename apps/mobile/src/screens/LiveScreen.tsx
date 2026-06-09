import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  countdown,
  dayLabel,
  isTeamMatch,
  nextMatch,
  relDay,
  teamFor,
  timeLabel,
  useMatchDetail,
  useMatches,
  venueFor,
  type MatchDoc,
} from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { Card, Flag, Icon, LiveDot, Pill, SectionTitle } from '../components/ui';
import { LiveCountdown } from '../components/LiveCountdown';
import { HeaderGradient } from '../components/HeaderGradient';

/** Rich full-width live match card. */
function LiveMatchCard({ m, mine, onOpen }: { m: MatchDoc; mine: boolean; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const v = venueFor(m.venueId);
  const { data: detail } = useMatchDetail(m.matchId);
  const poss = detail?.stats?.possession ?? null;

  const inner = (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 11,
          paddingHorizontal: 14,
          borderBottomWidth: 1,
          borderBottomColor: t.line,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Pill bg={t.live} color="#fff" fs={10} icon={<LiveDot size={6} color="#fff" />}>
            {m.minute}&apos;
          </Pill>
          {mine ? (
            <Pill bg={t.brandSoft} color={t.brandText} fs={10} icon={<Icon name="star" size={10} fill={t.brandText} sw={1} color={t.brandText} />}>
              YOUR MATCH
            </Pill>
          ) : null}
        </View>
        <Pill fs={10} color={t.faint}>
          {m.stage} · MD{m.matchday}
        </Pill>
      </View>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }}>
        {[
          { code: m.home, sc: m.score?.home ?? 0 },
          { code: m.away, sc: m.score?.away ?? 0 },
        ].map(({ code, sc }, i) => (
          <View
            key={code}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: i === 0 ? 13 : 0 }}
          >
            <Flag code={code} size={34} radius={10} />
            <Text style={{ flex: 1, fontSize: 16, color: t.text, ...f(800) }}>{teamFor(code)?.name}</Text>
            <Text style={{ fontSize: 26, color: t.text, fontVariant: ['tabular-nums'], ...f(800) }}>{sc}</Text>
          </View>
        ))}
        {poss ? (
          <View style={{ marginTop: 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontSize: 10.5, color: t.faint, ...mono(700) }}>POSS {poss[0]}%</Text>
              <Text style={{ fontSize: 10.5, color: t.faint, ...mono(700) }}>{poss[1]}% POSS</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 3, height: 5 }}>
              <View style={{ flex: poss[0]!, borderRadius: 3, backgroundColor: t.brandText }} />
              <View style={{ flex: poss[1]!, borderRadius: 3, backgroundColor: t.surface3 }} />
            </View>
          </View>
        ) : null}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 11,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: t.line,
          backgroundColor: t.surface2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
          <Icon name="pin" size={13} color={t.faint} />
          <Text numberOfLines={1} style={{ fontSize: 11.5, color: t.muted, ...f(400) }}>
            {v?.city}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12.5, color: t.brandText, ...f(800) }}>Match Centre</Text>
          <Icon name="chevron" size={14} sw={2.6} color={t.brandText} />
        </View>
      </View>
    </>
  );

  return (
    <Pressable onPress={() => onOpen(m.matchId)}>
      {mine ? (
        <HeaderGradient style={{ borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: t.brandLine }}>
          {inner}
        </HeaderGradient>
      ) : (
        <View style={{ borderRadius: 20, overflow: 'hidden', backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
          {inner}
        </View>
      )}
    </Pressable>
  );
}

function NextKickoff({ m, onOpen }: { m: MatchDoc; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 11,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.line,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Flag code={m.home} size={26} />
        <Flag code={m.away} size={26} style={{ marginLeft: -8 }} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 13.5, color: t.text, ...f(700) }}>
          {m.home} <Text style={{ color: t.faint, ...f(600) }}>v</Text> {m.away}
        </Text>
        <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>
          {m.stage} · {venueFor(m.venueId)?.city}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 13, color: t.brandText, ...mono(700) }}>{countdown(m.kickoff)}</Text>
        <Text style={{ fontSize: 10.5, color: t.faint, ...mono(400) }}>{relDay(m.kickoff).toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

export function LiveScreen() {
  const { t } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: matches = [] } = useMatches();
  const team = profile?.countryCode ?? '';
  const onOpen = (id: string) => router.push(`/match/${id}`);

  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort(
      (a, b) =>
        Number(isTeamMatch(b, team)) - Number(isTeamMatch(a, team)) || (b.minute ?? 0) - (a.minute ?? 0),
    );
  const myNext = nextMatch(matches, team);
  const upcomingSoon = matches
    .filter((m) => m.status === 'upcoming')
    .sort((a, b) => a.kickoff.toMillis() - b.kickoff.toMillis())
    .slice(0, 4);
  const myTeamLive = liveMatches.some((m) => isTeamMatch(m, team));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 27, color: t.text, letterSpacing: -0.6, ...f(800) }}>Live</Text>
          {liveMatches.length > 0 ? (
            <Pill bg={t.live} color="#fff" fs={10} icon={<LiveDot size={6} color="#fff" />}>
              {liveMatches.length} LIVE NOW
            </Pill>
          ) : (
            <Pill fs={10} bg={t.surface} color={t.muted} borderColor={t.line}>
              NONE LIVE
            </Pill>
          )}
        </View>
        {liveMatches.length > 1 ? (
          <Text style={{ marginTop: 8, fontSize: 13, color: t.muted, ...f(400) }}>
            {liveMatches.length} matches in play — tap any to open its Match Centre.
          </Text>
        ) : null}
      </HeaderGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {liveMatches.length > 0 ? (
          <View style={{ gap: 14 }}>
            {liveMatches.map((m) => (
              <LiveMatchCard key={m.matchId} m={m} mine={isTeamMatch(m, team)} onOpen={onOpen} />
            ))}

            {myNext && !myTeamLive ? (
              <View style={{ marginTop: 4 }}>
                <SectionTitle>{teamFor(team)?.name} are up next</SectionTitle>
                <Card pad={16} onPress={() => onOpen(myNext.matchId)}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 16,
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ alignItems: 'center', gap: 7 }}>
                      <Flag code={myNext.home} size={40} radius={12} />
                      <Text style={{ fontSize: 12, color: t.text, ...f(800) }}>{myNext.home}</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: t.faint, ...mono(700) }}>VS</Text>
                    <View style={{ alignItems: 'center', gap: 7 }}>
                      <Flag code={myNext.away} size={40} radius={12} />
                      <Text style={{ fontSize: 12, color: t.text, ...f(800) }}>{myNext.away}</Text>
                    </View>
                  </View>
                  <LiveCountdown target={myNext.kickoff} size="sm" />
                </Card>
              </View>
            ) : null}
          </View>
        ) : (
          // ── EMPTY STATE ──────────────────────────────────────────
          <View style={{ gap: 20 }}>
            <View style={{ alignItems: 'center', paddingTop: 20, paddingHorizontal: 16, paddingBottom: 6 }}>
              <View
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 38,
                  backgroundColor: t.surface,
                  borderWidth: 1,
                  borderColor: t.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Icon name="whistle" size={34} color={t.faint} />
              </View>
              <Text style={{ fontSize: 20, color: t.text, marginBottom: 6, ...f(800) }}>No matches live right now</Text>
              <Text style={{ fontSize: 14, color: t.muted, maxWidth: 280, lineHeight: 20, textAlign: 'center', ...f(400) }}>
                The pitch is quiet — but not for long. Here&apos;s your next kick-off.
              </Text>
            </View>

            {myNext ? (
              <HeaderGradient style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderColor: t.brandLine }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 16,
                  }}
                >
                  <Icon name="star" size={13} color={t.brandText} fill={t.brandText} sw={1} />
                  <Text
                    style={{ fontSize: 11, color: t.brandText, letterSpacing: 1, textTransform: 'uppercase', ...mono(700) }}
                  >
                    {teamFor(team)?.name} kick off in
                  </Text>
                </View>
                <LiveCountdown target={myNext.kickoff} size="lg" />
                <Pressable
                  onPress={() => onOpen(myNext.matchId)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    marginTop: 18,
                    paddingTop: 16,
                    borderTopWidth: 1,
                    borderTopColor: t.line,
                  }}
                >
                  <Flag code={myNext.home} size={28} radius={8} />
                  <Text style={{ fontSize: 15, color: t.text, ...f(800) }}>{myNext.home}</Text>
                  <Text style={{ fontSize: 12, color: t.faint, ...mono(700) }}>VS</Text>
                  <Text style={{ fontSize: 15, color: t.text, ...f(800) }}>{myNext.away}</Text>
                  <Flag code={myNext.away} size={28} radius={8} />
                </Pressable>
                <Text style={{ textAlign: 'center', marginTop: 10, fontSize: 11.5, color: t.muted, ...f(400) }}>
                  {dayLabel(myNext.kickoff)} · {timeLabel(myNext.kickoff)} · {venueFor(myNext.venueId)?.city}
                </Text>
              </HeaderGradient>
            ) : null}

            <View>
              <SectionTitle action="Full schedule" onAction={() => router.push('/matches')}>
                Next Kick-offs
              </SectionTitle>
              <View style={{ gap: 9 }}>
                {upcomingSoon.map((m) => (
                  <NextKickoff key={m.matchId} m={m} onOpen={onOpen} />
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
