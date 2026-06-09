import { Text, View } from 'react-native';
import { teamFor, type LineupSide, type MatchDoc } from '@repo/core';
import { ink } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
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
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: [{ translateX: -28 }, { translateY: -20 }],
        alignItems: 'center',
        width: 56,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: team?.primary ?? '#333',
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.7)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 12, color: dotInk, ...f(800) }}>{num}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={{
          marginTop: 3,
          fontSize: 9,
          color: '#fff',
          textShadowColor: 'rgba(0,0,0,0.9)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
          maxWidth: 60,
          ...f(700),
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
  const { t } = useTheme();
  const { home, away } = lineups;
  const hp = positionsFromFormation(home.formation);
  const ap = positionsFromFormation(away.formation);
  return (
    <View style={{ borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: t.line }}>
      {/* formation header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: t.surface,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Flag code={match.home} size={22} />
          <Text style={{ fontSize: 13, color: t.text, ...f(800) }}>{match.home}</Text>
          <Pill fs={10}>{home.formation}</Pill>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pill fs={10}>{away.formation}</Pill>
          <Text style={{ fontSize: 13, color: t.text, ...f(800) }}>{match.away}</Text>
          <Flag code={match.away} size={22} />
        </View>
      </View>
      {/* pitch */}
      <View style={{ height: 460, backgroundColor: '#1f7a44' }}>
        {/* stripes */}
        {Array.from({ length: 8 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              top: `${i * 12.5}%`,
              left: 0,
              right: 0,
              height: '12.5%',
              backgroundColor: i % 2 ? 'rgba(255,255,255,0.04)' : 'transparent',
            }}
          />
        ))}
        {/* markings */}
        <View style={{ position: 'absolute', top: 8, left: 8, right: 8, bottom: 8, borderWidth: 1.5, borderColor: LINE, borderRadius: 4 }} />
        <View style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: 1.5, backgroundColor: LINE }} />
        <View
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 76,
            height: 76,
            borderRadius: 38,
            borderWidth: 1.5,
            borderColor: LINE,
            transform: [{ translateX: -38 }, { translateY: -38 }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            width: 130,
            height: 56,
            borderWidth: 1.5,
            borderTopWidth: 0,
            borderColor: LINE,
            transform: [{ translateX: -65 }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            left: '50%',
            width: 130,
            height: 56,
            borderWidth: 1.5,
            borderBottomWidth: 0,
            borderColor: LINE,
            transform: [{ translateX: -65 }],
          }}
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
      <View style={{ flexDirection: 'row', backgroundColor: t.surface }}>
        {[home, away].map((sq, idx) => (
          <View
            key={idx}
            style={{
              flex: 1,
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRightWidth: idx === 0 ? 1 : 0,
              borderRightColor: t.line,
            }}
          >
            <Text style={{ fontSize: 10, color: t.faint, letterSpacing: 0.6, marginBottom: 8, ...mono(700) }}>
              BENCH · {idx === 0 ? match.home : match.away}
            </Text>
            {sq.bench.map((b) => (
              <Text key={b} style={{ fontSize: 12, color: t.muted, paddingVertical: 3, ...f(500) }}>
                {b}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
