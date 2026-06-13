import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { teamFor, timeLabel, dayShort, type MatchDoc } from '@repo/core';
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
  const live = m.status === 'live';
  const fin = m.status === 'final';
  const sc = m.score;
  const hWin = fin && sc ? sc.home > sc.away : false;
  const aWin = fin && sc ? sc.away > sc.home : false;

  const teamLine = (code: string, score: number | null, win: boolean) => (
    <View className="flex-row items-center gap-2.5">
      <Flag code={code} size={24} />
      <Text
        numberOfLines={1}
        className={`flex-1 text-[15px] ${
          win ? 'font-archivo-extrabold' : 'font-archivo-semibold'
        } ${fin && !win ? 'text-muted' : 'text-ink'}`}
      >
        {teamFor(code)?.name ?? code}
      </Text>
      <Text
        className={`min-w-4 text-right font-archivo-extrabold text-[17px] ${
          score == null ? 'text-faint' : fin && !win ? 'text-muted' : 'text-ink'
        }`}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {score == null ? '–' : score}
      </Text>
    </View>
  );

  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      className="flex-row items-stretch gap-3 rounded-[14px] border border-line bg-surface px-3.5 py-3"
    >
      <View className="w-[52px] items-center justify-center gap-[3px] border-r border-r-line pr-3">
        {live ? (
          <>
            <View className="flex-row items-center gap-1">
              <LiveDot size={6} />
              <Text className="font-mono-bold text-[10px] text-live">LIVE</Text>
            </View>
            <Text className="font-mono-bold text-[13px] text-live">{m.minute}&apos;</Text>
          </>
        ) : fin ? (
          <Text className="font-mono-bold text-[11px] text-muted">FT</Text>
        ) : (
          <>
            <Text
              className="font-archivo-extrabold text-[12px] text-ink"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {timeLabel(m.kickoff).replace(' ', '')}
            </Text>
            <Text className="font-mono-bold text-[9.5px] text-faint">
              {dayShort(m.kickoff).dow.toUpperCase()}
            </Text>
          </>
        )}
      </View>
      <View className="min-w-0 flex-1 justify-center gap-[9px]">
        {teamLine(m.home, sc ? sc.home : null, hWin)}
        {teamLine(m.away, sc ? sc.away : null, aWin)}
      </View>
      {showGroup ? (
        <View className="justify-center">
          <Pill fs={10} textClassName="text-faint">{m.group}</Pill>
        </View>
      ) : null}
    </Pressable>
  );
}

// horizontally-scrollable compact live chip
export function LiveChip({ match: m, onOpen }: { match: MatchDoc; onOpen: (id: string) => void }) {
  const flashing = useGoalFlash(m.lastGoal);
  const flashFor = (code: string) => flashing && m.lastGoal?.team === code;
  return (
    <Pressable
      onPress={() => onOpen(m.matchId)}
      className="min-w-[184px] overflow-hidden rounded-2xl border border-line bg-surface p-3.5"
    >
      <View className="absolute left-0 top-0 h-[999px] w-[3px] bg-live" />
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-[5px]">
          <LiveDot size={6} />
          <Text className="font-mono-bold text-[10px] text-live">{m.minute}&apos;</Text>
        </View>
        <Pill fs={9.5} textClassName="text-faint">GRP {m.group}</Pill>
      </View>
      {[
        { code: m.home, s: m.score?.home ?? 0 },
        { code: m.away, s: m.score?.away ?? 0 },
      ].map(({ code, s }, i) => (
        <View key={code} className={`flex-row items-center gap-2 ${i === 0 ? 'mb-2' : ''}`}>
          <Flag code={code} size={22} />
          <Text className="flex-1 font-archivo-bold text-[13.5px] text-ink">{code}</Text>
          <Text
            className={`font-archivo-extrabold text-[17px] ${flashFor(code) ? 'text-live' : 'text-ink'}`}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {s}
          </Text>
        </View>
      ))}
    </Pressable>
  );
}
