import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  countdown,
  dayLabel,
  isTeamMatch,
  nextMatch,
  relDay,
  standingsFor,
  teamFor,
  timeLabel,
  tzLabel,
  venueFor,
  favMatch,
  useMatches,
  type MatchDoc,
} from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { Card, Flag, Icon, LiveDot, Pill, SectionTitle } from '../components/ui';
import { LiveChip, MatchRow, useGoalFlash } from '../components/matchui';
import { HeaderGradient } from '../components/HeaderGradient';

/** Hero card for the favourite team's most relevant match (live/upcoming/result). */
function FavHero({ matches, team, onOpen }: { matches: MatchDoc[]; team: string; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const m = favMatch(matches, team);
  const flashing = useGoalFlash(m?.lastGoal ?? null);
  if (!m) return null;
  const tm = teamFor(team)!;
  const opp = m.home === team ? m.away : m.home;
  const live = m.status === 'live';
  const fin = m.status === 'final';
  const up = m.status === 'upcoming';
  const myScore = m.score ? (m.home === team ? m.score.home : m.score.away) : null;
  const opScore = m.score ? (m.home === team ? m.score.away : m.score.home) : null;
  const v = venueFor(m.venueId);
  const goalFlash = live && flashing;

  return (
    <Pressable onPress={() => onOpen(m.matchId)}>
      <HeaderGradient
        style={{ borderRadius: 22, padding: 18, overflow: 'hidden', borderWidth: 1, borderColor: t.brandLine }}
      >
        <View
          style={{
            position: 'absolute',
            top: -50,
            right: -30,
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: t.brand,
            opacity: 0.16,
          }}
        />
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
            <Icon name="star" size={14} color={t.brandText} fill={t.brandText} sw={1} />
            <Text style={{ fontSize: 11, letterSpacing: 1.2, color: t.brandText, textTransform: 'uppercase', ...mono(700) }}>
              Your Team · {tm.name}
            </Text>
          </View>
          {live ? (
            <Pill bg={t.live} color="#fff" fs={10} icon={<LiveDot size={6} color="#fff" />}>
              LIVE {m.minute}&apos;
            </Pill>
          ) : fin ? (
            <Pill fs={10}>FULL TIME</Pill>
          ) : (
            <Pill bg={t.brandSoft} color={t.brandText} fs={10} icon={<Icon name="clock" size={11} color={t.brandText} />}>
              {countdown(m.kickoff) ?? 'SOON'}
            </Pill>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flex: 1, alignItems: 'center', gap: 9 }}>
            <Flag code={team} size={50} radius={14} />
            <Text style={{ fontSize: 13, color: t.text, letterSpacing: 0.2, ...f(800) }}>{tm.code}</Text>
          </View>
          <View style={{ alignItems: 'center', minWidth: 78 }}>
            {up ? (
              <>
                <Text style={{ fontSize: 30, color: t.text, ...f(800) }}>{timeLabel(m.kickoff).split(' ')[0]}</Text>
                <Text style={{ fontSize: 11, color: t.muted, ...mono(700) }}>
                  {relDay(m.kickoff).toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={{
                    fontSize: 40,
                    lineHeight: 42,
                    color: goalFlash ? t.live : t.text,
                    fontVariant: ['tabular-nums'],
                    ...f(800),
                  }}
                >
                  {myScore}
                  <Text style={{ color: t.faint }}> : </Text>
                  {opScore}
                </Text>
                {live ? (
                  <Text style={{ fontSize: 10.5, color: t.live, marginTop: 4, ...mono(700) }}>{m.minute}&apos; LIVE</Text>
                ) : null}
              </>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 9 }}>
            <Flag code={opp} size={50} radius={14} />
            <Text style={{ fontSize: 13, color: t.text, letterSpacing: 0.2, ...f(800) }}>{opp}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: t.line,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
            <Icon name="pin" size={13} color={t.faint} />
            <Text numberOfLines={1} style={{ fontSize: 12, color: t.muted, ...f(500) }}>
              {v ? `${v.name}, ${v.city}` : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 12.5, color: t.brandText, ...f(800) }}>
              {live ? 'Match Centre' : up ? 'Preview' : 'Report'}
            </Text>
            <Icon name="chevron" size={14} sw={2.6} color={t.brandText} />
          </View>
        </View>
      </HeaderGradient>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  sub,
  onPress,
  accent,
}: {
  icon: string;
  label: string;
  sub: string;
  onPress: () => void;
  accent?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        gap: 9,
        padding: 14,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.line,
        borderRadius: 16,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: accent ? t.brandSoft : t.surface2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={20} color={accent ? t.brandText : t.muted} />
      </View>
      <View>
        <Text style={{ fontSize: 14, color: t.text, ...f(800) }}>{label}</Text>
        <Text style={{ fontSize: 11.5, color: t.faint, ...f(400) }}>{sub}</Text>
      </View>
    </Pressable>
  );
}

/** Single "next" fixture for the user's team — sits below the live section. */
function FavNextCard({ m, team, onOpen }: { m: MatchDoc; team: string; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const opp = m.home === team ? m.away : m.home;
  const isHome = m.home === team;
  const v = venueFor(m.venueId);
  const cd = countdown(m.kickoff);
  return (
    <View>
      <SectionTitle>Next for {teamFor(team)?.name}</SectionTitle>
      <Pressable onPress={() => onOpen(m.matchId)}>
        <HeaderGradient style={{ borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: t.brandLine }}>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}
          >
            <Text style={{ fontSize: 11.5, color: t.muted, letterSpacing: 0.4, ...mono(700) }}>
              {relDay(m.kickoff).toUpperCase()} · {timeLabel(m.kickoff)}
            </Text>
            {cd ? (
              <Pill bg={t.brandSoft} color={t.brandText} fs={10} icon={<Icon name="clock" size={11} color={t.brandText} />}>
                {cd}
              </Pill>
            ) : null}
            <Text style={{ fontSize: 10.5, color: t.faint, ...mono(700) }}>{isHome ? 'HOME' : 'AWAY'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 }}>
              <Flag code={team} size={34} radius={10} />
              <Text style={{ fontSize: 15, color: t.text, ...f(800) }}>{team}</Text>
            </View>
            <Text style={{ fontSize: 12, color: t.faint, ...mono(700) }}>VS</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1, justifyContent: 'flex-end' }}>
              <Text style={{ fontSize: 15, color: t.text, ...f(800) }}>{opp}</Text>
              <Flag code={opp} size={34} radius={10} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 12,
              paddingTop: 11,
              borderTopWidth: 1,
              borderTopColor: t.line,
            }}
          >
            <Icon name="pin" size={13} color={t.faint} />
            <Text numberOfLines={1} style={{ fontSize: 11.5, color: t.muted, ...f(400) }}>
              {v ? `${v.name}, ${v.city}` : ''} · {m.stage} · MD{m.matchday}
            </Text>
          </View>
        </HeaderGradient>
      </Pressable>
    </View>
  );
}

/** Labelled split within Today's Matches (live / yet to kick off / completed). */
function TodaySplit({
  label,
  matches,
  onOpen,
  live,
  color,
}: {
  label: string;
  matches: MatchDoc[];
  onOpen: (id: string) => void;
  live?: boolean;
  color?: string;
}) {
  const { t } = useTheme();
  if (!matches.length) return null;
  const dotColor = live ? t.live : color ?? t.faint;
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 2, marginBottom: 9 }}>
        {live ? <LiveDot size={6} /> : <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />}
        <Text style={{ fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: dotColor, ...mono(700) }}>
          {label}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: t.line }} />
        <Text style={{ fontSize: 10.5, color: t.faint, ...mono(700) }}>{matches.length}</Text>
      </View>
      <View style={{ gap: 9 }}>
        {matches.map((m) => (
          <MatchRow key={m.matchId} match={m} onOpen={onOpen} showGroup />
        ))}
      </View>
    </View>
  );
}

export function HomeScreen() {
  const { t } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: matches = [], isLoading } = useMatches();

  const team = profile?.countryCode ?? 'BRA';
  const name = profile?.displayName ?? 'fan';
  const tm = teamFor(team);

  const onOpen = (id: string) => router.push(`/match/${id}`);

  const today = useMemo(() => matches.filter((m) => relDay(m.kickoff) === 'Today'), [matches]);
  const ko = (m: MatchDoc) => m.kickoff.toMillis();
  // live always leads — favourite team first, then most-advanced; max two play at once
  const liveMatches = matches
    .filter((m) => m.status === 'live')
    .sort((a, b) => Number(isTeamMatch(b, team)) - Number(isTeamMatch(a, team)) || (b.minute ?? 0) - (a.minute ?? 0))
    .slice(0, 2);
  // if my team is playing right now, it gets the big hero up top
  const myLive = liveMatches.find((m) => isTeamMatch(m, team));
  const otherLive = liveMatches.filter((m) => !isTeamMatch(m, team));
  const favNext = nextMatch(matches, team);
  const todayLive = today.filter((m) => m.status === 'live');
  const todayUpcoming = today.filter((m) => m.status === 'upcoming').sort((a, b) => ko(a) - ko(b));
  const todayDone = today.filter((m) => m.status === 'final').sort((a, b) => ko(a) - ko(b));
  const groupTable = tm ? standingsFor(matches, tm.group) : [];
  const tz = tzLabel();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* header */}
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 11, color: t.brandText, letterSpacing: 1, textTransform: 'uppercase', ...mono(700) }}>
              {dayLabel(new Date())} · World Cup 2026
            </Text>
            <Text style={{ fontSize: 25, color: t.text, marginTop: 3, letterSpacing: -0.5, ...f(800) }}>
              Hi {name.split(' ')[0]}, Welcome
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View
              style={{
                backgroundColor: t.surface,
                borderWidth: 1,
                borderColor: t.line,
                width: 42,
                height: 42,
                borderRadius: 13,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="bell" size={20} color={t.text} />
              <View
                style={{
                  position: 'absolute',
                  top: 9,
                  right: 11,
                  width: 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: t.live,
                  borderWidth: 1.5,
                  borderColor: t.surface,
                }}
              />
            </View>
            <Pressable onPress={() => router.push('/profile')}>
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: t.brand,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 17, color: t.brandInk, ...f(800) }}>{name[0]?.toUpperCase()}</Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  borderWidth: 2,
                  borderColor: t.bg,
                  borderRadius: 9,
                  overflow: 'hidden',
                }}
              >
                <Flag code={team} size={14} radius={0} />
              </View>
            </Pressable>
          </View>
        </View>
      </HeaderGradient>

      {isLoading && matches.length === 0 ? (
        <View style={{ paddingTop: 60, alignItems: 'center' }}>
          <ActivityIndicator color={t.brandText} />
        </View>
      ) : (
        <View style={{ paddingTop: 6, paddingHorizontal: 16, gap: 22 }}>
          {myLive ? (
            <>
              <FavHero matches={matches} team={team} onOpen={onOpen} />
              {otherLive.length > 0 ? (
                <View>
                  <SectionTitle>Also Live</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                    {otherLive.map((m) => (
                      <LiveChip key={m.matchId} match={m} onOpen={onOpen} />
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </>
          ) : liveMatches.length > 0 ? (
            <>
              <View>
                <SectionTitle>Live Now</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                  {liveMatches.map((m) => (
                    <LiveChip key={m.matchId} match={m} onOpen={onOpen} />
                  ))}
                </ScrollView>
              </View>
              {favNext ? <FavNextCard m={favNext} team={team} onOpen={onOpen} /> : null}
            </>
          ) : (
            <FavHero matches={matches} team={team} onOpen={onOpen} />
          )}

          <View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginHorizontal: 2,
                marginBottom: 7,
              }}
            >
              <Text style={{ fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: t.muted, ...mono(700) }}>
                Today&apos;s Matches
              </Text>
              <Pressable
                onPress={() => router.push('/matches')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <Text style={{ color: t.brandText, fontSize: 12.5, ...f(700) }}>Full schedule</Text>
                <Icon name="chevron" size={14} sw={2.4} color={t.brandText} />
              </Pressable>
            </View>
            {tz ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 2, marginBottom: 13 }}>
                <Icon name="globe" size={12} color={t.faint} />
                <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>All times in your local time · {tz}</Text>
              </View>
            ) : null}
            {today.length === 0 ? (
              <Text style={{ fontSize: 13, color: t.faint, marginHorizontal: 2, ...f(400) }}>
                No matches scheduled today.
              </Text>
            ) : (
              <View style={{ gap: 16 }}>
                <TodaySplit label="Live" matches={todayLive} onOpen={onOpen} live />
                <TodaySplit label="Yet to kick off" matches={todayUpcoming} onOpen={onOpen} color={t.brandText} />
                <TodaySplit label="Completed" matches={todayDone} onOpen={onOpen} color={t.faint} />
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <QuickAction icon="trophy" label="Group Tables" sub="All 12 groups" accent onPress={() => router.push('/groups')} />
            <QuickAction icon="chart" label="Golden Boot" sub="Top scorers" onPress={() => router.push('/players')} />
          </View>

          {tm ? (
            <View>
              <SectionTitle action="Full table" onAction={() => router.push('/groups')}>
                Your Group · {tm.group}
              </SectionTitle>
              <Card pad={6}>
                {groupTable.map((r, i) => {
                  const mine = r.code === team;
                  return (
                    <View
                      key={r.code}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 11,
                        paddingVertical: 9,
                        paddingHorizontal: 10,
                        borderRadius: 11,
                        backgroundColor: mine ? t.brandSoft : 'transparent',
                      }}
                    >
                      <Text style={{ width: 18, fontSize: 13, color: i < 2 ? t.brandText : t.faint, ...mono(700) }}>
                        {i + 1}
                      </Text>
                      <Flag code={r.code} size={22} />
                      <Text style={{ flex: 1, fontSize: 13.5, color: t.text, ...f(mine ? 800 : 600) }}>
                        {teamFor(r.code)?.name}
                      </Text>
                      {r.live ? <LiveDot size={5} /> : null}
                      <Text style={{ fontSize: 11.5, color: t.faint, width: 58, textAlign: 'right', ...mono(400) }}>
                        {r.W}-{r.D}-{r.L}
                      </Text>
                      <Text
                        style={{
                          fontSize: 15,
                          color: t.text,
                          width: 20,
                          textAlign: 'right',
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
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}
