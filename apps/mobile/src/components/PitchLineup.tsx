import { Text, View } from 'react-native';
import { teamFor, type LineupSide, type MatchDoc } from '@repo/core';
import { ink } from '@repo/core';
import { Flag, Pill } from './ui';

/** Formation pitch with both XIs + benches (ported from the design's pitch.jsx). */

interface Pos {
  x: number; // 0..1 across
  d: number; // 0..1 depth from own goal
}

function positionsFromFormation(formation: string): Pos[] {
  const rows = formation.split('-').map(Number);
  const pts: Pos[] = [{ x: 0.5, d: 0.06 }]; // GK
  const depths =
    rows.length === 3
      ? [0.26, 0.52, 0.82]
      : rows.length === 4
        ? [0.24, 0.45, 0.66, 0.86]
        : rows.map((_, i) => 0.24 + (i * 0.62) / (rows.length - 1));
  rows.forEach((n, ri) => {
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? 0.5 : 0.12 + (i * 0.76) / (n - 1);
      pts.push({ x, d: depths[ri]! });
    }
  });
  return pts;
}

function PlayerDot({ code, num, name, x, y }: { code: string; num: string; name: string; x: number; y: number }) {
  const team = teamFor(code);
  const dotInk = team ? ink(team.primary) : '#fff';
  return (
    <View
      className="absolute w-14 items-center"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: [{ translateX: -28 }, { translateY: -20 }],
      }}
    >
      <View
        className="h-7 w-7 items-center justify-center rounded-full border-2 border-white/70"
        style={{ backgroundColor: team?.primary ?? '#333' }}
      >
        <Text className="font-archivo-extrabold text-[12px]" style={{ color: dotInk }}>
          {num}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        className="mt-[3px] max-w-[60px] font-archivo-bold text-[9px] text-white"
        style={{
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {name.split(' ').slice(-1)[0]}
      </Text>
    </View>
  );
}

const LINE = 'rgba(255,255,255,0.30)';

export function PitchLineup({
  match,
  lineups,
}: {
  match: MatchDoc;
  lineups: { home: LineupSide; away: LineupSide };
}) {
  const { home, away } = lineups;
  const hp = positionsFromFormation(home.formation);
  const ap = positionsFromFormation(away.formation);
  return (
    <View className="overflow-hidden rounded-[18px] border border-line">
      {/* formation header */}
      <View className="flex-row justify-between bg-surface px-4 py-3">
        <View className="flex-row items-center gap-2">
          <Flag code={match.home} size={22} />
          <Text className="font-archivo-extrabold text-[13px] text-ink">{match.home}</Text>
          <Pill fs={10}>{home.formation}</Pill>
        </View>
        <View className="flex-row items-center gap-2">
          <Pill fs={10}>{away.formation}</Pill>
          <Text className="font-archivo-extrabold text-[13px] text-ink">{match.away}</Text>
          <Flag code={match.away} size={22} />
        </View>
      </View>
      {/* pitch (fixed grass green — not themed) */}
      <View className="h-[460px] bg-[#1f7a44]">
        {/* stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            className={`absolute left-0 right-0 h-[12.5%] ${i % 2 ? 'bg-white/[0.04]' : 'bg-transparent'}`}
            style={{ top: `${i * 12.5}%` }}
          />
        ))}
        {/* markings */}
        <View className="absolute bottom-2 left-2 right-2 top-2 rounded border-[1.5px]" style={{ borderColor: LINE }} />
        <View className="absolute left-2 right-2 top-1/2 h-[1.5px]" style={{ backgroundColor: LINE }} />
        <View
          className="absolute left-1/2 top-1/2 h-[76px] w-[76px] rounded-full border-[1.5px]"
          style={{ borderColor: LINE, transform: [{ translateX: -38 }, { translateY: -38 }] }}
        />
        <View
          className="absolute left-1/2 top-2 h-14 w-[130px] border-[1.5px] border-t-0"
          style={{ borderColor: LINE, transform: [{ translateX: -65 }] }}
        />
        <View
          className="absolute bottom-2 left-1/2 h-14 w-[130px] border-[1.5px] border-b-0"
          style={{ borderColor: LINE, transform: [{ translateX: -65 }] }}
        />
        {/* away (top, attacking down) */}
        {away.xi.map((p, i) => (
          <PlayerDot key={'a' + i} code={match.away} num={p.num} name={p.name} x={1 - ap[i]!.x} y={ap[i]!.d * 0.46 + 0.02} />
        ))}
        {/* home (bottom, attacking up) */}
        {home.xi.map((p, i) => (
          <PlayerDot key={'h' + i} code={match.home} num={p.num} name={p.name} x={hp[i]!.x} y={0.98 - hp[i]!.d * 0.46} />
        ))}
      </View>
      {/* benches */}
      <View className="flex-row bg-surface">
        {[home, away].map((sq, idx) => (
          <View key={idx} className={`flex-1 px-3.5 py-3 ${idx === 0 ? 'border-r border-r-line' : ''}`}>
            <Text className="mb-2 font-mono-bold text-[10px] tracking-[0.6px] text-faint">
              BENCH · {idx === 0 ? match.home : match.away}
            </Text>
            {sq.bench.map((b) => (
              <Text key={b} className="py-[3px] font-archivo-medium text-[12px] text-muted">
                {b}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
