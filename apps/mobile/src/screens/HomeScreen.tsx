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
  useNow,
  type MatchDoc,
} from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Card, Flag, Icon, LiveDot, Pill, SectionTitle } from '../components/ui';
import { LiveChip, MatchRow, useGoalFlash } from '../components/matchui';
import { HeaderGradient } from '../components/HeaderGradient';

/** Hero card for the favourite team's most relevant match (live/upcoming/result). */
function FavHero({ matches, team, onOpen }: { matches: MatchDoc[]; team: string; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const now = useNow();
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
        <View className="absolute -right-[30px] -top-[50px] h-[180px] w-[180px] rounded-full bg-brand opacity-[0.16]" />
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center gap-[7px]">
            <Icon name="star" size={14} color={t.brandText} fill={t.brandText} sw={1} />
            <Text className="font-mono-bold text-[11px] uppercase tracking-[1.2px] text-brand-text">
              Your Team · {tm.name}
            </Text>
          </View>
          {live ? (
            <Pill className="bg-live" textClassName="text-white" fs={10} icon={<LiveDot size={6} color="#fff" />}>
              LIVE {m.minute}&apos;
            </Pill>
          ) : fin ? (
            <Pill fs={10}>FULL TIME</Pill>
          ) : (
            <Pill className="bg-brand-soft" textClassName="text-brand-text" fs={10} icon={<Icon name="clock" size={11} color={t.brandText} />}>
              {countdown(m.kickoff, now) ?? 'SOON'}
            </Pill>
          )}
        </View>

        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1 items-center gap-[9px]">
            <Flag code={team} size={50} radius={14} />
            <Text className="font-archivo-extrabold text-[13px] tracking-[0.2px] text-ink">{tm.code}</Text>
          </View>
          <View className="min-w-[78px] items-center">
            {up ? (
              <>
                <Text className="font-archivo-extrabold text-[30px] text-ink">{timeLabel(m.kickoff).split(' ')[0]}</Text>
                <Text className="font-mono-bold text-[11px] text-muted">
                  {relDay(m.kickoff).toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                <Text
                  className={`font-archivo-extrabold text-[40px] leading-[42px] ${
                    goalFlash ? 'text-live' : 'text-ink'
                  }`}
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {myScore}
                  <Text className="text-faint"> : </Text>
                  {opScore}
                </Text>
                {live ? (
                  <Text className="mt-1 font-mono-bold text-[10.5px] text-live">{m.minute}&apos; LIVE</Text>
                ) : null}
              </>
            )}
          </View>
          <View className="flex-1 items-center gap-[9px]">
            <Flag code={opp} size={50} radius={14} />
            <Text className="font-archivo-extrabold text-[13px] tracking-[0.2px] text-ink">{opp}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center justify-between border-t border-t-line pt-3.5">
          <View className="shrink flex-row items-center gap-1.5">
            <Icon name="pin" size={13} color={t.faint} />
            <Text numberOfLines={1} className="font-archivo-medium text-[12px] text-muted">
              {v ? `${v.name}, ${v.city}` : ''}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="font-archivo-extrabold text-[12.5px] text-brand-text">
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
      className="flex-1 gap-[9px] rounded-2xl border border-line bg-surface p-3.5"
    >
      <View
        className={`h-[38px] w-[38px] items-center justify-center rounded-[11px] ${
          accent ? 'bg-brand-soft' : 'bg-surface2'
        }`}
      >
        <Icon name={icon} size={20} color={accent ? t.brandText : t.muted} />
      </View>
      <View>
        <Text className="font-archivo-extrabold text-[14px] text-ink">{label}</Text>
        <Text className="font-archivo text-[11.5px] text-faint">{sub}</Text>
      </View>
    </Pressable>
  );
}

/** Single "next" fixture for the user's team — sits below the live section. */
function FavNextCard({ m, team, onOpen }: { m: MatchDoc; team: string; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const now = useNow();
  const opp = m.home === team ? m.away : m.home;
  const isHome = m.home === team;
  const v = venueFor(m.venueId);
  const cd = countdown(m.kickoff, now);
  return (
    <View>
      <SectionTitle>Next for {teamFor(team)?.name}</SectionTitle>
      <Pressable onPress={() => onOpen(m.matchId)}>
        <HeaderGradient style={{ borderRadius: 16, padding: 14, overflow: 'hidden', borderWidth: 1, borderColor: t.brandLine }}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-mono-bold text-[11.5px] tracking-[0.4px] text-muted">
              {relDay(m.kickoff).toUpperCase()} · {timeLabel(m.kickoff)}
            </Text>
            {cd ? (
              <Pill className="bg-brand-soft" textClassName="text-brand-text" fs={10} icon={<Icon name="clock" size={11} color={t.brandText} />}>
                {cd}
              </Pill>
            ) : null}
            <Text className="font-mono-bold text-[10.5px] text-faint">{isHome ? 'HOME' : 'AWAY'}</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center gap-[9px]">
              <Flag code={team} size={34} radius={10} />
              <Text className="font-archivo-extrabold text-[15px] text-ink">{team}</Text>
            </View>
            <Text className="font-mono-bold text-[12px] text-faint">VS</Text>
            <View className="flex-1 flex-row items-center justify-end gap-[9px]">
              <Text className="font-archivo-extrabold text-[15px] text-ink">{opp}</Text>
              <Flag code={opp} size={34} radius={10} />
            </View>
          </View>
          <View className="mt-3 flex-row items-center gap-1.5 border-t border-t-line pt-[11px]">
            <Icon name="pin" size={13} color={t.faint} />
            <Text numberOfLines={1} className="font-archivo text-[11.5px] text-muted">
              {v ? `${v.name}, ${v.city}` : ''} · {m.stage}
              {m.matchday != null ? ` · MD${m.matchday}` : ''}
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
      <View className="mx-0.5 mb-[9px] flex-row items-center gap-2">
        {live ? <LiveDot size={6} /> : <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor }} />}
        <Text className="font-mono-bold text-[11px] uppercase tracking-[0.8px]" style={{ color: dotColor }}>
          {label}
        </Text>
        <View className="h-px flex-1 bg-line" />
        <Text className="font-mono-bold text-[10.5px] text-faint">{matches.length}</Text>
      </View>
      <View className="gap-[9px]">
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
    <ScrollView className="flex-1 bg-canvas" contentContainerClassName="pb-6">
      {/* header */}
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 20 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-mono-bold text-[11px] uppercase tracking-[1px] text-brand-text">
              {dayLabel(new Date())} · World Cup 2026
            </Text>
            <Text className="mt-[3px] font-archivo-extrabold text-[25px] tracking-[-0.5px] text-ink">
              Hi {name.split(' ')[0]}, Welcome
            </Text>
          </View>
          <View className="flex-row items-center gap-3">
            <View className="h-[42px] w-[42px] items-center justify-center rounded-[13px] border border-line bg-surface">
              <Icon name="bell" size={20} color={t.text} />
              <View className="absolute right-[11px] top-[9px] h-[7px] w-[7px] rounded-full border-[1.5px] border-surface bg-live" />
            </View>
            <Pressable onPress={() => router.push('/profile')}>
              <View className="h-[42px] w-[42px] items-center justify-center rounded-full bg-brand">
                <Text className="font-archivo-extrabold text-[17px] text-brand-ink">{name[0]?.toUpperCase()}</Text>
              </View>
              <View className="absolute -bottom-0.5 -right-0.5 overflow-hidden rounded-[9px] border-2 border-canvas">
                <Flag code={team} size={14} radius={0} />
              </View>
            </Pressable>
          </View>
        </View>
      </HeaderGradient>

      {isLoading && matches.length === 0 ? (
        <View className="items-center pt-[60px]">
          <ActivityIndicator color={t.brandText} />
        </View>
      ) : (
        <View className="gap-[22px] px-4 pt-1.5">
          {myLive ? (
            <>
              <FavHero matches={matches} team={team} onOpen={onOpen} />
              {otherLive.length > 0 ? (
                <View>
                  <SectionTitle>Also Live</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2.5">
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
            <View className="mx-0.5 mb-[7px] flex-row items-center justify-between">
              <Text className="font-mono-bold text-[13px] uppercase tracking-[1.4px] text-muted">
                Today&apos;s Matches
              </Text>
              <Pressable
                onPress={() => router.push('/matches')}
                className="flex-row items-center gap-0.5"
              >
                <Text className="font-archivo-bold text-[12.5px] text-brand-text">Full schedule</Text>
                <Icon name="chevron" size={14} sw={2.4} color={t.brandText} />
              </Pressable>
            </View>
            {tz ? (
              <View className="mx-0.5 mb-[13px] flex-row items-center gap-1.5">
                <Icon name="globe" size={12} color={t.faint} />
                <Text className="font-archivo text-[11px] text-faint">All times in your local time · {tz}</Text>
              </View>
            ) : null}
            {today.length === 0 ? (
              <Text className="mx-0.5 font-archivo text-[13px] text-faint">
                No matches scheduled today.
              </Text>
            ) : (
              <View className="gap-4">
                <TodaySplit label="Live" matches={todayLive} onOpen={onOpen} live />
                <TodaySplit label="Yet to kick off" matches={todayUpcoming} onOpen={onOpen} color={t.brandText} />
                <TodaySplit label="Completed" matches={todayDone} onOpen={onOpen} color={t.faint} />
              </View>
            )}
          </View>

          <View className="flex-row gap-2.5">
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
                      className={`flex-row items-center gap-[11px] rounded-[11px] px-2.5 py-[9px] ${
                        mine ? 'bg-brand-soft' : 'bg-transparent'
                      }`}
                    >
                      <Text className={`w-[18px] font-mono-bold text-[13px] ${i < 2 ? 'text-brand-text' : 'text-faint'}`}>
                        {i + 1}
                      </Text>
                      <Flag code={r.code} size={22} />
                      <Text className={`flex-1 text-[13.5px] text-ink ${mine ? 'font-archivo-extrabold' : 'font-archivo-semibold'}`}>
                        {teamFor(r.code)?.name}
                      </Text>
                      {r.live ? <LiveDot size={5} /> : null}
                      <Text className="w-[58px] text-right font-mono text-[11.5px] text-faint">
                        {r.W}-{r.D}-{r.L}
                      </Text>
                      <Text
                        className="w-5 text-right font-archivo-extrabold text-[15px] text-ink"
                        style={{ fontVariant: ['tabular-nums'] }}
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
