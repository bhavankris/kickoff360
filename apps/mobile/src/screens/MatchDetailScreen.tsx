import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  relDay,
  teamFor,
  timeLabel,
  toDate,
  tzLabel,
  useMatchDetail,
  useMatches,
  venueFor,
  wcForm,
  type InjuryNote,
  type MatchDoc,
  type MatchEvent,
  type MatchDetailDoc,
  type MatchStats,
  type Venue,
} from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { Card, Flag, Icon, LiveDot, MediaSlot, Pill, SectionTitle, StatBar } from '../components/ui';
import { PitchLineup } from '../components/PitchLineup';
import { HeaderGradient } from '../components/HeaderGradient';

/** Match Centre — Summary (timeline + form), Stats, Lineups, Info. */

function EvIcon({ type }: { type: MatchEvent['type'] }) {
  const { t } = useTheme();
  if (type === 'goal') {
    return (
      <View className="h-[22px] w-[22px] items-center justify-center rounded-full bg-ink">
        <View className="h-[13px] w-[13px] rounded-[7px] border border-[#111] bg-white" />
      </View>
    );
  }
  if (type === 'yellow') return <View className="h-[19px] w-3.5 rounded-[3px] bg-[#ffcf2e]" />;
  if (type === 'red') return <View className="h-[19px] w-3.5 rounded-[3px] bg-[#e8323a]" />;
  return <Icon name="share" size={18} color={t.brandText} />; // sub
}

function EvContent({ e, align }: { e: MatchEvent; align: 'left' | 'right' }) {
  const right = align === 'right';
  return (
    <View className={`max-w-[150px] ${right ? 'items-end' : 'items-start'}`}>
      <View className={`items-center gap-[7px] ${right ? 'flex-row-reverse' : 'flex-row'}`}>
        <EvIcon type={e.type} />
        <Text className="font-archivo-extrabold text-[13.5px] text-ink">{e.player}</Text>
      </View>
      <Text className={`mt-0.5 font-archivo text-[11px] text-faint ${right ? 'text-right' : 'text-left'}`}>
        {e.detail}
      </Text>
    </View>
  );
}

/** Home events anchored left, away right, minutes down the centre. */
function Timeline({ match, events }: { match: MatchDoc; events: MatchEvent[] }) {
  return (
    <View>
      {/* side legend */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-[7px]">
          <Flag code={match.home} size={20} />
          <Text className="font-archivo-extrabold text-[12px] text-ink">{match.home}</Text>
        </View>
        <Text className="font-mono-bold text-[10px] tracking-[0.6px] text-faint">TIMELINE</Text>
        <View className="flex-row items-center gap-[7px]">
          <Text className="font-archivo-extrabold text-[12px] text-ink">{match.away}</Text>
          <Flag code={match.away} size={20} />
        </View>
      </View>
      <View className="py-1">
        <View
          className="absolute bottom-0 left-1/2 top-0 w-0.5 bg-line"
          style={{ transform: [{ translateX: -1 }] }}
        />
        {[...events].reverse().map((e, i) => {
          const isHome = e.team === match.home;
          return (
            <View key={i} className="mb-3.5 flex-row items-center">
              <View className="flex-1 items-end pr-3.5">
                {isHome ? <EvContent e={e} align="right" /> : null}
              </View>
              <View className="w-[34px] items-center">
                <Text
                  className={`w-[34px] overflow-hidden rounded-full py-[3px] text-center font-mono-bold text-[11px] ${
                    e.type === 'goal' ? 'bg-brand text-brand-ink' : 'bg-surface2 text-muted'
                  }`}
                >
                  {e.minute}&apos;
                </Text>
              </View>
              <View className="flex-1 items-start pl-3.5">
                {!isHome ? <EvContent e={e} align="left" /> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { t } = useTheme();
  return (
    <View className="flex-row items-center gap-3 border-b border-b-line py-3">
      <Icon name={icon} size={18} color={t.faint} />
      <Text className="flex-1 font-archivo text-[13px] text-muted">{label}</Text>
      <Text className="text-right font-archivo-bold text-[13.5px] text-ink">{value}</Text>
    </View>
  );
}

function SummaryTab({
  m,
  matches,
  detail,
  live,
  up,
}: {
  m: MatchDoc;
  matches: MatchDoc[];
  detail: MatchDetailDoc | null;
  live: boolean;
  up: boolean;
}) {
  const { t } = useTheme();
  const hasEvents = !!detail?.events?.length;
  return (
    <View className="gap-[18px]">
      {live && detail?.stats ? (
        <Card pad={16}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-mono-bold text-[12px] tracking-[0.6px] text-muted">POSSESSION</Text>
            <View className="flex-row items-center gap-[5px]">
              <LiveDot size={6} />
              <Text className="font-mono-bold text-[11px] text-live">LIVE</Text>
            </View>
          </View>
          <StatBar label="POSSESSION" a={detail.stats.possession[0]!} b={detail.stats.possession[1]!} suffix="%" />
          <StatBar label="EXPECTED GOALS (xG)" a={detail.stats.xg[0]!} b={detail.stats.xg[1]!} />
        </Card>
      ) : null}

      {up && detail?.preview ? (
        <Card pad={16} style={{ backgroundColor: t.brandSoft, borderColor: t.brandLine }}>
          <Text className="mb-2 font-mono-bold text-[11px] tracking-[0.8px] text-brand-text">
            MATCH PREVIEW
          </Text>
          <Text className="font-archivo text-[14.5px] leading-[22px] text-ink">{detail.preview}</Text>
        </Card>
      ) : null}

      {hasEvents ? (
        <View>
          <SectionTitle>{live ? 'Live Timeline' : 'Match Events'}</SectionTitle>
          <Timeline match={m} events={detail!.events} />
        </View>
      ) : !up ? (
        <Card pad={20} style={{ alignItems: 'center' }}>
          <Icon name="whistle" size={26} color={t.faint} />
          <Text className="mt-2.5 text-center font-archivo text-[13.5px] text-muted">
            Full match report and goal-by-goal timeline coming up shortly.
          </Text>
        </Card>
      ) : null}

      <View>
        <SectionTitle>At this World Cup</SectionTitle>
        <Card pad={14}>
          {[m.home, m.away].map((c, idx) => {
            const form = wcForm(matches, c, toDate(m.kickoff));
            return (
              <View
                key={c}
                className={`flex-row items-center gap-3 px-0.5 py-[9px] ${
                  idx ? 'border-t border-t-line' : ''
                }`}
              >
                <Flag code={c} size={22} />
                <View className="min-w-0 flex-1">
                  <Text className="font-archivo-bold text-[13.5px] text-ink">{teamFor(c)?.name}</Text>
                  <Text className="font-archivo text-[11px] text-faint">
                    {form.length === 0
                      ? 'Opening match of their campaign'
                      : `${form.length} played · ${form.filter((x) => x.r === 'W').length}W ${form.filter((x) => x.r === 'D').length}D ${form.filter((x) => x.r === 'L').length}L`}
                  </Text>
                </View>
                {form.length === 0 ? (
                  <Pill fs={10}>1ST GAME</Pill>
                ) : (
                  <View className="flex-row gap-[5px]">
                    {form.map((x, i) => (
                      <View
                        key={i}
                        className={`h-[26px] w-[26px] items-center justify-center rounded-[7px] ${
                          x.r === 'W' ? 'bg-win' : x.r === 'L' ? 'bg-live' : 'bg-faint'
                        }`}
                      >
                        <Text className="font-archivo-extrabold text-[11px] text-white">{x.r}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

function StatsTab({ m, stats }: { m: MatchDoc; stats: MatchStats }) {
  const rows: [string, number[], string, boolean?][] = [
    ['POSSESSION', stats.possession, '%'],
    ['SHOTS', stats.shots, ''],
    ['SHOTS ON TARGET', stats.onTarget, ''],
    ['EXPECTED GOALS', stats.xg, ''],
    ['CORNERS', stats.corners, ''],
    ['FOULS', stats.fouls, '', true],
    ['OFFSIDES', stats.offsides, '', true],
    ['PASS ACCURACY', stats.passAcc, '%'],
    ['SAVES', stats.saves, ''],
  ];
  return (
    <Card pad={18}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-[7px]">
          <Flag code={m.home} size={22} />
          <Text className="font-archivo-extrabold text-[13px] text-ink">{m.home}</Text>
        </View>
        <Text className="font-mono-bold text-[11px] text-faint">TEAM STATS</Text>
        <View className="flex-row items-center gap-[7px]">
          <Text className="font-archivo-extrabold text-[13px] text-ink">{m.away}</Text>
          <Flag code={m.away} size={22} />
        </View>
      </View>
      {rows.map(([label, val, suf, inv]) => (
        <StatBar key={label} label={label} a={val[0]!} b={val[1]!} suffix={suf} invert={inv} />
      ))}
    </Card>
  );
}

function TeamNews({ injuries }: { injuries: InjuryNote[] }) {
  return (
    <View className="mt-[18px]">
      <SectionTitle>Team News &amp; Injuries</SectionTitle>
      <Card pad={6}>
        {injuries.map((inj, i) => (
          <View key={i} className="flex-row items-center gap-3 px-2.5 py-[11px]">
            <Flag code={inj.team} size={26} />
            <View className="min-w-0 flex-1">
              <Text className="font-archivo-bold text-[14px] text-ink">
                {inj.player} <Text className="font-archivo-semibold text-[11px] text-faint">· {inj.pos}</Text>
              </Text>
              <Text className="font-archivo text-[11.5px] text-faint">{inj.note}</Text>
            </View>
            <Pill
              fs={10}
              className={
                inj.status.startsWith('Out')
                  ? 'bg-[rgba(232,50,58,0.16)]'
                  : inj.status.startsWith('Doubt')
                    ? 'bg-[rgba(255,207,46,0.16)]'
                    : 'bg-brand-soft'
              }
              textClassName={
                inj.status.startsWith('Out')
                  ? 'text-[#ff6b6f]'
                  : inj.status.startsWith('Doubt')
                    ? 'text-[#ffcf2e]'
                    : 'text-brand-text'
              }
            >
              {inj.status.split(' ')[0]}
            </Pill>
          </View>
        ))}
      </Card>
    </View>
  );
}

function InfoTab({ m, v, detail }: { m: MatchDoc; v: Venue | undefined; detail: MatchDetailDoc | null }) {
  const { t } = useTheme();
  return (
    <View className="gap-[18px]">
      <HeaderGradient
        style={{
          borderRadius: 16,
          paddingVertical: 20,
          paddingHorizontal: 18,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.brandLine,
        }}
      >
        <View className="absolute -right-6 -top-10 h-[150px] w-[150px] rounded-full bg-brand opacity-[0.16]" />
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Pill className="bg-brand-soft" textClassName="text-brand-text" fs={10} icon={<Icon name="pin" size={11} color={t.brandText} />}>
              VENUE
            </Pill>
            <Text className="mb-0.5 mt-2.5 font-archivo-extrabold text-[20px] tracking-[-0.4px] text-ink">
              {v?.name}
            </Text>
            <Text className="font-archivo text-[12.5px] text-muted">
              {v?.city}, {v?.country}
            </Text>
          </View>
          <View className="h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-surface2">
            <Icon name="field" size={24} color={t.brandText} />
          </View>
        </View>
      </HeaderGradient>
      <Card pad={16} style={{ paddingTop: 4, paddingBottom: 4 }}>
        <FactRow icon="user" label="Capacity" value={v ? v.cap.toLocaleString() : '—'} />
        <FactRow icon="field" label="Pitch" value={v?.pitch ?? '—'} />
        <FactRow icon="clock" label="Kick-off (your time)" value={`${timeLabel(m.kickoff)} ${tzLabel()}`} />
        {detail?.referee ? <FactRow icon="whistle" label="Referee" value={detail.referee} /> : null}
        {detail?.weather ? <FactRow icon="globe" label="Conditions" value={detail.weather} /> : null}
        {detail?.attendance ? <FactRow icon="user" label="Attendance" value={detail.attendance} /> : null}
      </Card>
      <View>
        <SectionTitle>Getting There</SectionTitle>
        <MediaSlot label="MAP — TRANSIT & PARKING" h={120} />
      </View>
      <View>
        <SectionTitle>Fan Zone</SectionTitle>
        <Card pad={18} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View className="h-11 w-11 items-center justify-center rounded-[13px] bg-brand-soft">
            <Icon name="globe" size={22} color={t.brandText} />
          </View>
          <View className="flex-1">
            <Text className="font-archivo-extrabold text-[14px] text-ink">Social buzz &amp; fan feeds</Text>
            <Text className="font-archivo text-[12px] text-faint">Live posts, polls and chants</Text>
          </View>
          <Pill fs={10}>SOON</Pill>
        </Card>
      </View>
    </View>
  );
}

export function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: matches = [] } = useMatches();
  const { data: detail = null } = useMatchDetail(id ?? '');
  const [tab, setTab] = useState('Summary');

  const m = useMemo(() => matches.find((x) => x.matchId === id), [matches, id]);
  if (!m) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <Text className="font-archivo text-[14px] text-faint">Match not found.</Text>
      </View>
    );
  }

  const live = m.status === 'live';
  const up = m.status === 'upcoming';
  const h = teamFor(m.home);
  const a = teamFor(m.away);
  const v = venueFor(m.venueId);
  const otherLive = matches.filter((x) => x.status === 'live' && x.matchId !== m.matchId);
  const mine = profile?.countryCode === m.home || profile?.countryCode === m.away;

  const tabs = ['Summary', detail?.stats && 'Stats', detail?.lineups && 'Lineups', 'Info'].filter(Boolean) as string[];
  const activeTab = tabs.includes(tab) ? tab : 'Summary';

  return (
    <View className="flex-1 bg-canvas">
      {/* header */}
      <HeaderGradient style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 18 }}>
        <View className="mb-1.5 flex-row justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-[38px] w-[38px] items-center justify-center rounded-xl border border-glass-line bg-glass"
          >
            <Icon name="back" size={20} color={t.text} />
          </Pressable>
          <Pill className="bg-glass" textClassName="text-muted" fs={10}>
            {m.stage} · MD{m.matchday}
          </Pill>
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl border border-glass-line bg-glass">
            <Icon name="share" size={18} color={t.text} />
          </View>
        </View>
        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-1 items-center gap-[9px]">
            <Flag code={m.home} size={56} radius={15} />
            <Text className="font-archivo-extrabold text-[14px] text-ink">{h?.name}</Text>
          </View>
          <View className="min-w-[96px] items-center">
            {up ? (
              <>
                <Text className="font-archivo-extrabold text-[26px] text-ink">{timeLabel(m.kickoff)}</Text>
                <Text className="mt-0.5 font-mono text-[11px] text-muted">
                  {relDay(m.kickoff).toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                <Text
                  className="font-archivo-extrabold text-[48px] leading-[50px] text-ink"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {m.score?.home}
                  <Text className="text-faint"> : </Text>
                  {m.score?.away}
                </Text>
                {live ? (
                  <View className="mt-2">
                    <Pill className="bg-live" textClassName="text-white" fs={10} icon={<LiveDot size={6} color="#fff" />}>
                      LIVE {m.minute}&apos;
                    </Pill>
                  </View>
                ) : (
                  <Text className="mt-1.5 font-mono text-[11px] text-muted">FULL TIME</Text>
                )}
              </>
            )}
          </View>
          <View className="flex-1 items-center gap-[9px]">
            <Flag code={m.away} size={56} radius={15} />
            <Text className="font-archivo-extrabold text-[14px] text-ink">{a?.name}</Text>
          </View>
        </View>
        <View className="mt-3.5 flex-row items-center justify-center gap-1.5">
          <Icon name="pin" size={13} color={t.faint} />
          <Text className="font-archivo text-[12px] text-muted">
            {v?.name} · {v?.city}
          </Text>
          {mine ? <Icon name="star" size={12} color={t.brandText} fill={t.brandText} sw={1} /> : null}
        </View>
      </HeaderGradient>

      {/* tab strip */}
      <View className="flex-row border-b border-b-line bg-surface px-2">
        {tabs.map((tb) => (
          <Pressable
            key={tb}
            onPress={() => setTab(tb)}
            className="flex-1 items-center pb-[11px] pt-[13px]"
          >
            <Text
              className={`text-[13px] ${
                activeTab === tb ? 'font-archivo-extrabold text-brand-text' : 'font-archivo-semibold text-faint'
              }`}
            >
              {tb}
            </Text>
            {activeTab === tb ? (
              <View className="absolute bottom-0 h-[3px] w-[30px] rounded-[3px] bg-brand-text" />
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* switch between other live matches without leaving the centre */}
      {otherLive.length > 0 ? (
        <View className="border-b border-b-line bg-surface px-3 py-[9px]">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="items-center gap-2">
            <View className="flex-row items-center gap-[5px] px-0.5">
              <LiveDot size={6} />
              <Text className="font-mono-bold text-[10px] tracking-[0.4px] text-live">ALSO LIVE</Text>
            </View>
            {otherLive.map((x) => (
              <Pressable
                key={x.matchId}
                onPress={() => router.setParams({ id: x.matchId })}
                className="flex-row items-center gap-[7px] rounded-full border border-line bg-surface2 px-2.5 py-1.5"
              >
                <Flag code={x.home} size={18} />
                <Text
                  className="font-archivo-extrabold text-[12.5px] text-ink"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {x.score?.home}-{x.score?.away}
                </Text>
                <Flag code={x.away} size={18} />
                <Text className="font-mono-bold text-[10.5px] text-live">{x.minute}&apos;</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {activeTab === 'Summary' ? <SummaryTab m={m} matches={matches} detail={detail} live={live} up={up} /> : null}
        {activeTab === 'Stats' && detail?.stats ? <StatsTab m={m} stats={detail.stats} /> : null}
        {activeTab === 'Lineups' && detail?.lineups ? (
          <View>
            <PitchLineup match={m} lineups={detail.lineups} />
            {detail.injuries?.length ? <TeamNews injuries={detail.injuries} /> : null}
          </View>
        ) : null}
        {activeTab === 'Info' ? <InfoTab m={m} v={v} detail={detail} /> : null}
      </ScrollView>
    </View>
  );
}
