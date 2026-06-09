import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { teamFor, timeLabel, dayShort, type MatchDoc } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { Flag, LiveDot, Pill } from './ui';

/** Shared match cards/rows (ported from the design's matchui). */

const FLASH_MS = 4500;

/** True for ~4.5s after a goal lands — drives the score "pop" on live cards. */
export function useGoalFlash(lastGoal: MatchDoc['lastGoal']): boolean {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!lastGoal) return;
    const remaining = FLASH_MS - (Date.now() - lastGoal.at.toMillis());
    if (remaining <= 0) return;
    const on = setTimeout(() => setFlash(true), 0);
    const off = setTimeout(() => setFlash(false), remaining);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [lastGoal]);
  return flash;
}

// compact list row
export function MatchRow({
  match: m,
  onOpen,
  showGroup,
}: {
  match: MatchDoc;
  onOpen: (id: string) => void;
  showGroup?: boolean;
}) {
  const { t } = useTheme();
  const live = m.status === 'live';
  const fin = m.status === 'final';
  const sc = m.score;
  const hWin = fin && sc ? sc.home > sc.away : false;
  const aWin = fin && sc ? sc.away > sc.home : false;

  const teamLine = (code: string, score: number | null, win: boolean) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Flag code={code} size={24} />
      <Text
        numberOfLines={1}
        style={{ flex: 1, fontSize: 15, color: fin && !win ? t.muted : t.text, ...f(win ? 800 : 600) }}
      >
        {teamFor(code)?.name ?? code}
      </Text>
      <Text
        style={{
          fontSize: 17,
          minWidth: 16,
          textAlign: 'right',
          fontVariant: ['tabular-nums'],
          color: score == null ? t.faint : fin && !win ? t.muted : t.text,
          ...f(800),
        }}
      >
        {score == null ? '–' : score}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: t.surface,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: t.line,
      }}
    >
      <View
        style={{
          width: 52,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          borderRightWidth: 1,
          borderRightColor: t.line,
          paddingRight: 12,
        }}
      >
        {live ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <LiveDot size={6} />
              <Text style={{ fontSize: 10, color: t.live, ...mono(700) }}>LIVE</Text>
            </View>
            <Text style={{ fontSize: 13, color: t.live, ...mono(700) }}>{m.minute}&apos;</Text>
          </>
        ) : fin ? (
          <Text style={{ fontSize: 11, color: t.muted, ...mono(700) }}>FT</Text>
        ) : (
          <>
            <Text style={{ fontSize: 12, color: t.text, fontVariant: ['tabular-nums'], ...f(800) }}>
              {timeLabel(m.kickoff).replace(' ', '')}
            </Text>
            <Text style={{ fontSize: 9.5, color: t.faint, ...mono(700) }}>
              {dayShort(m.kickoff).dow.toUpperCase()}
            </Text>
          </>
        )}
      </View>
      <View style={{ flex: 1, gap: 9, justifyContent: 'center', minWidth: 0 }}>
        {teamLine(m.home, sc ? sc.home : null, hWin)}
        {teamLine(m.away, sc ? sc.away : null, aWin)}
      </View>
      {showGroup ? (
        <View style={{ justifyContent: 'center' }}>
          <Pill fs={10} color={t.faint}>{m.group}</Pill>
        </View>
      ) : null}
    </Pressable>
  );
}

// horizontally-scrollable compact live chip
export function LiveChip({ match: m, onOpen }: { match: MatchDoc; onOpen: (id: string) => void }) {
  const { t } = useTheme();
  const flashing = useGoalFlash(m.lastGoal);
  const flashFor = (code: string) => flashing && m.lastGoal?.team === code;
  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      style={{
        minWidth: 184,
        padding: 14,
        borderRadius: 16,
        backgroundColor: t.surface,
        borderWidth: 1,
        borderColor: t.line,
        overflow: 'hidden',
      }}
    >
      <View style={{ position: 'absolute', top: 0, left: 0, width: 3, height: 999, backgroundColor: t.live }} />
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <LiveDot size={6} />
          <Text style={{ fontSize: 10, color: t.live, ...mono(700) }}>{m.minute}&apos;</Text>
        </View>
        <Pill fs={9.5} color={t.faint}>GRP {m.group}</Pill>
      </View>
      {[
        { code: m.home, s: m.score?.home ?? 0 },
        { code: m.away, s: m.score?.away ?? 0 },
      ].map(({ code, s }, i) => (
        <View
          key={code}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: i === 0 ? 8 : 0 }}
        >
          <Flag code={code} size={22} />
          <Text style={{ flex: 1, fontSize: 13.5, color: t.text, ...f(700) }}>{code}</Text>
          <Text
            style={{
              fontSize: 17,
              color: flashFor(code) ? t.live : t.text,
              fontVariant: ['tabular-nums'],
              ...f(800),
            }}
          >
            {s}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}
