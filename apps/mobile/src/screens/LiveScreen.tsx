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
  useNow,
  venueFor,
  type MatchDoc,
} from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
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
      <View className="flex-row items-center justify-between border-b border-b-line px-3.5 py-[11px]">
        <View className="flex-row items-center gap-[7px]">
          <Pill className="bg-live" textClassName="text-white" fs={10} icon={<LiveDot size={6} color="#fff" />}>
            {m.minute}&apos;
          </Pill>
          {mine ? (
            <Pill className="bg-brand-soft" textClassName="text-brand-text" fs={10} icon={<Icon name="star" size={10} fill={t.brandText} sw={1} color={t.brandText} />}>
              YOUR MATCH
            </Pill>
          ) : null}
        </View>
        <Pill fs={10} textClassName="text-faint">
          {m.stage}
          {m.matchday != null ? ` · MD${m.matchday}` : ''}
        </Pill>
      </View>
      <View className="px-4 pb-3.5 pt-4">
        {[
          { code: m.home, sc: m.score?.home ?? 0 },
          { code: m.away, sc: m.score?.away ?? 0 },
        ].map(({ code, sc }, i) => (
          <View
            key={code}
            className={`flex-row items-center gap-3 ${i === 0 ? 'mb-[13px]' : ''}`}
          >
            <Flag code={code} size={34} radius={10} />
            <Text className="flex-1 font-archivo-extrabold text-[16px] text-ink">{teamFor(code)?.name}</Text>
            <Text
              className="font-archivo-extrabold text-[26px] text-ink"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {sc}
            </Text>
          </View>
        ))}
        {poss ? (
          <View className="mt-3.5">
            <View className="mb-[5px] flex-row justify-between">
              <Text className="font-mono-bold text-[10.5px] text-faint">POSS {poss[0]}%</Text>
              <Text className="font-mono-bold text-[10.5px] text-faint">{poss[1]}% POSS</Text>
            </View>
            <View className="h-[5px] flex-row gap-[3px]">
              <View className="rounded-[3px] bg-brand-text" style={{ flex: poss[0]! }} />
              <View className="rounded-[3px] bg-surface3" style={{ flex: poss[1]! }} />
            </View>
          </View>
        ) : null}
      </View>
      <View className="flex-row items-center justify-between border-t border-t-line bg-surface2 px-4 py-[11px]">
        <View className="shrink flex-row items-center gap-1.5">
          <Icon name="pin" size={13} color={t.faint} />
          <Text numberOfLines={1} className="font-archivo text-[11.5px] text-muted">
            {v?.city}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="font-archivo-extrabold text-[12.5px] text-brand-text">Match Centre</Text>
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
        <View className="overflow-hidden rounded-[20px] border border-line bg-surface">
          {inner}
        </View>
      )}
    </Pressable>
  );
}

function NextKickoff({ m, onOpen }: { m: MatchDoc; onOpen: (id: string) => void }) {
  const now = useNow();
  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      className="flex-row items-center gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-[11px]"
    >
      <View className="flex-row items-center">
        <Flag code={m.home} size={26} />
        <Flag code={m.away} size={26} style={{ marginLeft: -8 }} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="font-archivo-bold text-[13.5px] text-ink">
          {m.home} <Text className="font-archivo-semibold text-faint">v</Text> {m.away}
        </Text>
        <Text className="font-archivo text-[11px] text-faint">
          {m.stage} · {venueFor(m.venueId)?.city}
        </Text>
      </View>
      <View className="items-end">
        <Text className="font-mono-bold text-[13px] text-brand-text">{countdown(m.kickoff, now)}</Text>
        <Text className="font-mono text-[10.5px] text-faint">{relDay(m.kickoff).toUpperCase()}</Text>
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
    <View className="flex-1 bg-canvas">
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingHorizontal: 20, paddingBottom: 18 }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-archivo-extrabold text-[27px] tracking-[-0.6px] text-ink">Live</Text>
          {liveMatches.length > 0 ? (
            <Pill className="bg-live" textClassName="text-white" fs={10} icon={<LiveDot size={6} color="#fff" />}>
              {liveMatches.length} LIVE NOW
            </Pill>
          ) : (
            <Pill fs={10} className="border border-line bg-surface" textClassName="text-muted">
              NONE LIVE
            </Pill>
          )}
        </View>
        {liveMatches.length > 1 ? (
          <Text className="mt-2 font-archivo text-[13px] text-muted">
            {liveMatches.length} matches in play — tap any to open its Match Centre.
          </Text>
        ) : null}
      </HeaderGradient>

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        {liveMatches.length > 0 ? (
          <View className="gap-3.5">
            {liveMatches.map((m) => (
              <LiveMatchCard key={m.matchId} m={m} mine={isTeamMatch(m, team)} onOpen={onOpen} />
            ))}

            {myNext && !myTeamLive ? (
              <View className="mt-1">
                <SectionTitle>{teamFor(team)?.name} are up next</SectionTitle>
                <Card pad={16} onPress={() => onOpen(myNext.matchId)}>
                  <View className="mb-4 flex-row items-center justify-center gap-4">
                    <View className="items-center gap-[7px]">
                      <Flag code={myNext.home} size={40} radius={12} />
                      <Text className="font-archivo-extrabold text-[12px] text-ink">{myNext.home}</Text>
                    </View>
                    <Text className="font-mono-bold text-[13px] text-faint">VS</Text>
                    <View className="items-center gap-[7px]">
                      <Flag code={myNext.away} size={40} radius={12} />
                      <Text className="font-archivo-extrabold text-[12px] text-ink">{myNext.away}</Text>
                    </View>
                  </View>
                  <LiveCountdown target={myNext.kickoff} size="sm" />
                </Card>
              </View>
            ) : null}
          </View>
        ) : (
          // ── EMPTY STATE ──────────────────────────────────────────
          <View className="gap-5">
            <View className="items-center px-4 pb-1.5 pt-5">
              <View className="mb-4 h-[76px] w-[76px] items-center justify-center rounded-full border border-line bg-surface">
                <Icon name="whistle" size={34} color={t.faint} />
              </View>
              <Text className="mb-1.5 font-archivo-extrabold text-[20px] text-ink">No matches live right now</Text>
              <Text className="max-w-[280px] text-center font-archivo text-[14px] leading-[20px] text-muted">
                The pitch is quiet — but not for long. Here&apos;s your next kick-off.
              </Text>
            </View>

            {myNext ? (
              <HeaderGradient style={{ borderRadius: 22, padding: 20, borderWidth: 1, borderColor: t.brandLine }}>
                <View className="mb-4 flex-row items-center justify-center gap-1.5">
                  <Icon name="star" size={13} color={t.brandText} fill={t.brandText} sw={1} />
                  <Text className="font-mono-bold text-[11px] uppercase tracking-[1px] text-brand-text">
                    {teamFor(team)?.name} kick off in
                  </Text>
                </View>
                <LiveCountdown target={myNext.kickoff} size="lg" />
                <Pressable
                  onPress={() => onOpen(myNext.matchId)}
                  className="mt-[18px] flex-row items-center justify-center gap-3 border-t border-t-line pt-4"
                >
                  <Flag code={myNext.home} size={28} radius={8} />
                  <Text className="font-archivo-extrabold text-[15px] text-ink">{myNext.home}</Text>
                  <Text className="font-mono-bold text-[12px] text-faint">VS</Text>
                  <Text className="font-archivo-extrabold text-[15px] text-ink">{myNext.away}</Text>
                  <Flag code={myNext.away} size={28} radius={8} />
                </Pressable>
                <Text className="mt-2.5 text-center font-archivo text-[11.5px] text-muted">
                  {dayLabel(myNext.kickoff)} · {timeLabel(myNext.kickoff)} · {venueFor(myNext.venueId)?.city}
                </Text>
              </HeaderGradient>
            ) : null}

            <View>
              <SectionTitle action="Full schedule" onAction={() => router.push('/matches')}>
                Next Kick-offs
              </SectionTitle>
              <View className="gap-[9px]">
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
