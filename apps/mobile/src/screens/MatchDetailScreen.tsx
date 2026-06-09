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
import { f, mono } from '../theme/fonts';
import { Card, Flag, Icon, LiveDot, MediaSlot, Pill, SectionTitle, StatBar } from '../components/ui';
import { PitchLineup } from '../components/PitchLineup';
import { HeaderGradient } from '../components/HeaderGradient';

/** Match Centre — Summary (timeline + form), Stats, Lineups, Info. */

function EvIcon({ type }: { type: MatchEvent['type'] }) {
  const { t } = useTheme();
  if (type === 'goal') {
    return (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: t.text,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: '#fff', borderWidth: 1, borderColor: '#111' }} />
      </View>
    );
  }
  if (type === 'yellow') return <View style={{ width: 14, height: 19, borderRadius: 3, backgroundColor: '#ffcf2e' }} />;
  if (type === 'red') return <View style={{ width: 14, height: 19, borderRadius: 3, backgroundColor: '#e8323a' }} />;
  return <Icon name="share" size={18} color={t.brandText} />; // sub
}

function EvContent({ e, align }: { e: MatchEvent; align: 'left' | 'right' }) {
  const { t } = useTheme();
  const right = align === 'right';
  return (
    <View style={{ alignItems: right ? 'flex-end' : 'flex-start', maxWidth: 150 }}>
      <View style={{ flexDirection: right ? 'row-reverse' : 'row', alignItems: 'center', gap: 7 }}>
        <EvIcon type={e.type} />
        <Text style={{ fontSize: 13.5, color: t.text, ...f(800) }}>{e.player}</Text>
      </View>
      <Text style={{ fontSize: 11, color: t.faint, marginTop: 2, textAlign: right ? 'right' : 'left', ...f(400) }}>
        {e.detail}
      </Text>
    </View>
  );
}

/** Home events anchored left, away right, minutes down the centre. */
function Timeline({ match, events }: { match: MatchDoc; events: MatchEvent[] }) {
  const { t } = useTheme();
  return (
    <View>
      {/* side legend */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Flag code={match.home} size={20} />
          <Text style={{ fontSize: 12, color: t.text, ...f(800) }}>{match.home}</Text>
        </View>
        <Text style={{ fontSize: 10, color: t.faint, letterSpacing: 0.6, ...mono(700) }}>TIMELINE</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 12, color: t.text, ...f(800) }}>{match.away}</Text>
          <Flag code={match.away} size={20} />
        </View>
      </View>
      <View style={{ paddingVertical: 4 }}>
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 2,
            backgroundColor: t.line,
            transform: [{ translateX: -1 }],
          }}
        />
        {[...events].reverse().map((e, i) => {
          const isHome = e.team === match.home;
          return (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 14 }}>
                {isHome ? <EvContent e={e} align="right" /> : null}
              </View>
              <View style={{ width: 34, alignItems: 'center' }}>
                <Text
                  style={{
                    backgroundColor: e.type === 'goal' ? t.brand : t.surface2,
                    color: e.type === 'goal' ? t.brandInk : t.muted,
                    fontSize: 11,
                    paddingVertical: 3,
                    width: 34,
                    textAlign: 'center',
                    borderRadius: 100,
                    overflow: 'hidden',
                    ...mono(700),
                  }}
                >
                  {e.minute}&apos;
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'flex-start', paddingLeft: 14 }}>
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
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: t.line,
      }}
    >
      <Icon name={icon} size={18} color={t.faint} />
      <Text style={{ fontSize: 13, color: t.muted, flex: 1, ...f(400) }}>{label}</Text>
      <Text style={{ fontSize: 13.5, color: t.text, textAlign: 'right', ...f(700) }}>{value}</Text>
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
    <View style={{ gap: 18 }}>
      {live && detail?.stats ? (
        <Card pad={16}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: t.muted, letterSpacing: 0.6, ...mono(700) }}>POSSESSION</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <LiveDot size={6} />
              <Text style={{ fontSize: 11, color: t.live, ...mono(700) }}>LIVE</Text>
            </View>
          </View>
          <StatBar label="POSSESSION" a={detail.stats.possession[0]!} b={detail.stats.possession[1]!} suffix="%" />
          <StatBar label="EXPECTED GOALS (xG)" a={detail.stats.xg[0]!} b={detail.stats.xg[1]!} />
        </Card>
      ) : null}

      {up && detail?.preview ? (
        <Card pad={16} style={{ backgroundColor: t.brandSoft, borderColor: t.brandLine }}>
          <Text style={{ fontSize: 11, color: t.brandText, letterSpacing: 0.8, marginBottom: 8, ...mono(700) }}>
            MATCH PREVIEW
          </Text>
          <Text style={{ fontSize: 14.5, lineHeight: 22, color: t.text, ...f(400) }}>{detail.preview}</Text>
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
          <Text style={{ marginTop: 10, fontSize: 13.5, color: t.muted, textAlign: 'center', ...f(400) }}>
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
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 9,
                  paddingHorizontal: 2,
                  borderTopWidth: idx ? 1 : 0,
                  borderTopColor: t.line,
                }}
              >
                <Flag code={c} size={22} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: 13.5, color: t.text, ...f(700) }}>{teamFor(c)?.name}</Text>
                  <Text style={{ fontSize: 11, color: t.faint, ...f(400) }}>
                    {form.length === 0
                      ? 'Opening match of their campaign'
                      : `${form.length} played · ${form.filter((x) => x.r === 'W').length}W ${form.filter((x) => x.r === 'D').length}D ${form.filter((x) => x.r === 'L').length}L`}
                  </Text>
                </View>
                {form.length === 0 ? (
                  <Pill fs={10}>1ST GAME</Pill>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    {form.map((x, i) => (
                      <View
                        key={i}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 7,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: x.r === 'W' ? t.win : x.r === 'L' ? t.live : t.faint,
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#fff', ...f(800) }}>{x.r}</Text>
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
  const { t } = useTheme();
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
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Flag code={m.home} size={22} />
          <Text style={{ fontSize: 13, color: t.text, ...f(800) }}>{m.home}</Text>
        </View>
        <Text style={{ fontSize: 11, color: t.faint, ...mono(700) }}>TEAM STATS</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ fontSize: 13, color: t.text, ...f(800) }}>{m.away}</Text>
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
  const { t } = useTheme();
  return (
    <View style={{ marginTop: 18 }}>
      <SectionTitle>Team News &amp; Injuries</SectionTitle>
      <Card pad={6}>
        {injuries.map((inj, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 10 }}>
            <Flag code={inj.team} size={26} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 14, color: t.text, ...f(700) }}>
                {inj.player} <Text style={{ fontSize: 11, color: t.faint, ...f(600) }}>· {inj.pos}</Text>
              </Text>
              <Text style={{ fontSize: 11.5, color: t.faint, ...f(400) }}>{inj.note}</Text>
            </View>
            <Pill
              fs={10}
              bg={
                inj.status.startsWith('Out')
                  ? 'rgba(232,50,58,0.16)'
                  : inj.status.startsWith('Doubt')
                    ? 'rgba(255,207,46,0.16)'
                    : t.brandSoft
              }
              color={inj.status.startsWith('Out') ? '#ff6b6f' : inj.status.startsWith('Doubt') ? '#ffcf2e' : t.brandText}
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
    <View style={{ gap: 18 }}>
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
        <View
          style={{
            position: 'absolute',
            top: -40,
            right: -24,
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: t.brand,
            opacity: 0.16,
          }}
        />
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ minWidth: 0, flex: 1 }}>
            <Pill bg={t.brandSoft} color={t.brandText} fs={10} icon={<Icon name="pin" size={11} color={t.brandText} />}>
              VENUE
            </Pill>
            <Text style={{ fontSize: 20, color: t.text, marginTop: 10, marginBottom: 2, letterSpacing: -0.4, ...f(800) }}>
              {v?.name}
            </Text>
            <Text style={{ fontSize: 12.5, color: t.muted, ...f(400) }}>
              {v?.city}, {v?.country}
            </Text>
          </View>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              backgroundColor: t.surface2,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              backgroundColor: t.brandSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="globe" size={22} color={t.brandText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, color: t.text, ...f(800) }}>Social buzz &amp; fan feeds</Text>
            <Text style={{ fontSize: 12, color: t.faint, ...f(400) }}>Live posts, polls and chants</Text>
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
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: t.faint, fontSize: 14, ...f(400) }}>Match not found.</Text>
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
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* header */}
      <HeaderGradient style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: t.glass,
              borderWidth: 1,
              borderColor: t.glassLine,
              width: 38,
              height: 38,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="back" size={20} color={t.text} />
          </Pressable>
          <Pill bg={t.glass} color={t.muted} fs={10}>
            {m.stage} · MD{m.matchday}
          </Pill>
          <View
            style={{
              backgroundColor: t.glass,
              borderWidth: 1,
              borderColor: t.glassLine,
              width: 38,
              height: 38,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="share" size={18} color={t.text} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <View style={{ flex: 1, alignItems: 'center', gap: 9 }}>
            <Flag code={m.home} size={56} radius={15} />
            <Text style={{ fontSize: 14, color: t.text, ...f(800) }}>{h?.name}</Text>
          </View>
          <View style={{ minWidth: 96, alignItems: 'center' }}>
            {up ? (
              <>
                <Text style={{ fontSize: 26, color: t.text, ...f(800) }}>{timeLabel(m.kickoff)}</Text>
                <Text style={{ fontSize: 11, color: t.muted, marginTop: 2, ...mono(400) }}>
                  {relDay(m.kickoff).toUpperCase()}
                </Text>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 48, lineHeight: 50, color: t.text, fontVariant: ['tabular-nums'], ...f(800) }}>
                  {m.score?.home}
                  <Text style={{ color: t.faint }}> : </Text>
                  {m.score?.away}
                </Text>
                {live ? (
                  <View style={{ marginTop: 8 }}>
                    <Pill bg={t.live} color="#fff" fs={10} icon={<LiveDot size={6} color="#fff" />}>
                      LIVE {m.minute}&apos;
                    </Pill>
                  </View>
                ) : (
                  <Text style={{ fontSize: 11, color: t.muted, marginTop: 6, ...mono(400) }}>FULL TIME</Text>
                )}
              </>
            )}
          </View>
          <View style={{ flex: 1, alignItems: 'center', gap: 9 }}>
            <Flag code={m.away} size={56} radius={15} />
            <Text style={{ fontSize: 14, color: t.text, ...f(800) }}>{a?.name}</Text>
          </View>
        </View>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}
        >
          <Icon name="pin" size={13} color={t.faint} />
          <Text style={{ fontSize: 12, color: t.muted, ...f(400) }}>
            {v?.name} · {v?.city}
          </Text>
          {mine ? <Icon name="star" size={12} color={t.brandText} fill={t.brandText} sw={1} /> : null}
        </View>
      </HeaderGradient>

      {/* tab strip */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: t.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.line,
          paddingHorizontal: 8,
        }}
      >
        {tabs.map((tb) => (
          <Pressable
            key={tb}
            onPress={() => setTab(tb)}
            style={{ flex: 1, paddingTop: 13, paddingBottom: 11, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, color: activeTab === tb ? t.brandText : t.faint, ...f(activeTab === tb ? 800 : 600) }}>
              {tb}
            </Text>
            {activeTab === tb ? (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: 30,
                  height: 3,
                  borderRadius: 3,
                  backgroundColor: t.brandText,
                }}
              />
            ) : null}
          </Pressable>
        ))}
      </View>

      {/* switch between other live matches without leaving the centre */}
      {otherLive.length > 0 ? (
        <View style={{ backgroundColor: t.surface, borderBottomWidth: 1, borderBottomColor: t.line, paddingVertical: 9, paddingHorizontal: 12 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 2 }}>
              <LiveDot size={6} />
              <Text style={{ fontSize: 10, color: t.live, letterSpacing: 0.4, ...mono(700) }}>ALSO LIVE</Text>
            </View>
            {otherLive.map((x) => (
              <Pressable
                key={x.matchId}
                onPress={() => router.setParams({ id: x.matchId })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 100,
                  backgroundColor: t.surface2,
                  borderWidth: 1,
                  borderColor: t.line,
                }}
              >
                <Flag code={x.home} size={18} />
                <Text style={{ fontSize: 12.5, color: t.text, fontVariant: ['tabular-nums'], ...f(800) }}>
                  {x.score?.home}-{x.score?.away}
                </Text>
                <Flag code={x.away} size={18} />
                <Text style={{ fontSize: 10.5, color: t.live, ...mono(700) }}>{x.minute}&apos;</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
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
