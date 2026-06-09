import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { teamFor } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';

/** kickoff360 shared UI kit — icons, flag chips, atoms (ported from the design). */

// ── Icon set (24px, stroke) ───────────────────────────────────────
const ICON_PATHS: Record<string, string> = {
  home:     'M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  trophy:   'M7 4h10v3a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14.5h6M10 20h4M12 16v4',
  chart:    'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user:     'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0',
  bell:     'M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0',
  search:   'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3',
  pin:      'M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  whistle:  'M3 12a4 4 0 0 0 8 0H21M11 12V9M14 6h5M16 6v3',
  shirt:    'M8 3 4 6l2 3 2-1v10h8V8l2 1 2-3-4-3-2 2H10L8 3Z',
  back:     'M15 5l-7 7 7 7',
  chevron:  'M9 5l7 7-7 7',
  clock:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  bolt:     'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  check:    'M5 12l5 5L20 6',
  plus:     'M12 5v14M5 12h14',
  share:    'M16 6l-4-4-4 4M12 2v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  star:     'M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18l-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z',
  cross:    'M18 6 6 18M6 6l12 12',
  flame:    'M12 3s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3s0 2 1.5 2S12 7 12 3Z',
  field:    'M3 5h18v14H3zM12 5v14M3 9h4v6H3zM17 9h4v6h-4zM12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  filter:   'M3 5h18M6 12h12M10 19h4',
  globe:    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18',
};

export type IconName = keyof typeof ICON_PATHS;

export function Icon({
  name,
  size = 22,
  color,
  sw = 1.9,
  fill = 'none',
}: {
  name: string;
  size?: number;
  color?: string;
  sw?: number;
  fill?: string;
}) {
  const { t } = useTheme();
  const d = ICON_PATHS[name] ?? '';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {d
        .split('M')
        .filter(Boolean)
        .map((seg, i) => (
          <Path
            key={i}
            d={'M' + seg}
            fill={fill}
            stroke={color ?? t.text}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
    </Svg>
  );
}

// ── Flag chip (stylized banded) ───────────────────────────────────
export function Flag({
  code,
  size = 28,
  radius,
  style,
}: {
  code: string;
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const team = teamFor(code);
  const r = radius ?? Math.round(size * 0.26);
  if (!team) {
    return <View style={[{ width: size, height: size, borderRadius: r, backgroundColor: '#222' }, style]} />;
  }
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: r,
          overflow: 'hidden',
          flexDirection: team.dir === 'h' ? 'column' : 'row',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.18)',
          flexShrink: 0,
        },
        style,
      ]}
    >
      {team.bands.map((c, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </View>
  );
}

// ── Pill / badge ──────────────────────────────────────────────────
export function Pill({
  children,
  color,
  bg,
  borderColor,
  fs = 11,
  style,
  monoFont = true,
  icon,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  borderColor?: string;
  fs?: number;
  style?: StyleProp<ViewStyle>;
  monoFont?: boolean;
  icon?: ReactNode;
}) {
  const { t } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          paddingVertical: 3,
          paddingHorizontal: 8,
          borderRadius: 100,
          backgroundColor: bg ?? t.surface2,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      {icon}
      <Text
        style={{
          color: color ?? t.muted,
          fontSize: fs,
          letterSpacing: monoFont ? 0.6 : 0.2,
          textTransform: monoFont ? 'uppercase' : 'none',
          ...(monoFont ? mono(700) : f(700)),
        }}
      >
        {children}
      </Text>
    </View>
  );
}

export function LiveDot({ size = 7, color }: { size?: number; color?: string }) {
  const { t } = useTheme();
  const [pulse] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? t.live,
        opacity: pulse,
      }}
    />
  );
}

// ── Dual stat bar (possession etc.) ───────────────────────────────
export function StatBar({
  label,
  a,
  b,
  suffix = '',
  invert = false,
}: {
  label: string;
  a: number;
  b: number;
  suffix?: string;
  invert?: boolean;
}) {
  const { t } = useTheme();
  const total = a + b || 1;
  const ap = (a / total) * 100;
  const aWin = invert ? a < b : a > b;
  const bWin = invert ? b < a : b > a;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
        <Text style={{ fontSize: 15, color: aWin ? t.text : t.muted, fontVariant: ['tabular-nums'], ...f(800) }}>
          {a}{suffix}
        </Text>
        <Text style={{ fontSize: 11, color: t.faint, textTransform: 'uppercase', letterSpacing: 0.8, ...mono(700) }}>
          {label}
        </Text>
        <Text style={{ fontSize: 15, color: bWin ? t.text : t.muted, fontVariant: ['tabular-nums'], ...f(800) }}>
          {b}{suffix}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 4, height: 6 }}>
        <View style={{ flex: ap, borderRadius: 3, backgroundColor: t.brandText, opacity: aWin ? 1 : 0.5 }} />
        <View style={{ flex: 100 - ap, borderRadius: 3, backgroundColor: t.accentText, opacity: bWin ? 1 : 0.5 }} />
      </View>
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────
export function Card({
  children,
  pad = 16,
  style,
  onPress,
}: {
  children: ReactNode;
  pad?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const { t } = useTheme();
  const base: ViewStyle = {
    backgroundColor: t.surface,
    borderRadius: 18,
    padding: pad,
    borderWidth: 1,
    borderColor: t.line,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[base, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function SectionTitle({
  children,
  action,
  onAction,
}: {
  children: ReactNode;
  action?: string;
  onAction?: () => void;
}) {
  const { t } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
        marginBottom: 12,
        marginHorizontal: 2,
      }}
    >
      <Text style={{ fontSize: 13, letterSpacing: 1.4, textTransform: 'uppercase', color: t.muted, ...mono(700) }}>
        {children}
      </Text>
      {action ? (
        <Pressable onPress={onAction} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <Text style={{ color: t.brandText, fontSize: 12.5, ...f(700) }}>{action}</Text>
          <Icon name="chevron" size={14} sw={2.4} color={t.brandText} />
        </Pressable>
      ) : null}
    </View>
  );
}

// ── Media placeholder (map slot etc.) ─────────────────────────────
export function MediaSlot({ label, h = 150, radius = 16 }: { label?: string; h?: number; radius?: number }) {
  const { t } = useTheme();
  return (
    <View
      style={{
        height: h,
        borderRadius: radius,
        overflow: 'hidden',
        backgroundColor: t.surface2,
        borderWidth: 1,
        borderColor: t.line,
        justifyContent: 'flex-end',
      }}
    >
      {label ? (
        <Text
          style={{
            position: 'absolute',
            top: 10,
            left: 12,
            fontSize: 10.5,
            color: t.faint,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            backgroundColor: 'rgba(0,0,0,0.35)',
            paddingVertical: 3,
            paddingHorizontal: 7,
            borderRadius: 6,
            overflow: 'hidden',
            ...mono(400),
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

