import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { matchesByDay, useMatches } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
import { LiveDot } from '../components/ui';
import { MatchRow } from '../components/matchui';
import { HeaderGradient } from '../components/HeaderGradient';

type Filter = 'all' | 'live' | 'upcoming' | 'final' | 'mine';

function FilterChip({
  active,
  onPress,
  label,
  dot,
}: {
  active: boolean;
  onPress: () => void;
  label: string;
  dot?: boolean;
}) {
  const { t } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 100,
        backgroundColor: active ? t.brand : t.surface,
        borderWidth: 1,
        borderColor: active ? t.brand : t.line,
      }}
    >
      {dot ? <LiveDot size={6} color={active ? t.brandInk : t.live} /> : null}
      <Text style={{ fontSize: 13, color: active ? t.brandInk : t.muted, ...f(700) }}>{label}</Text>
    </Pressable>
  );
}

export function MatchesScreen() {
  const { t } = useTheme();
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: matches = [] } = useMatches();
  const [filter, setFilter] = useState<Filter>('all');
  const team = profile?.countryCode ?? '';

  const filters: { id: Filter; label: string; dot?: boolean }[] = [
    { id: 'all', label: 'All' },
    { id: 'live', label: 'Live', dot: true },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'final', label: 'Results' },
    { id: 'mine', label: 'My Team' },
  ];

  const days = useMemo(() => {
    let l = matches;
    if (filter === 'live') l = l.filter((m) => m.status === 'live');
    else if (filter === 'upcoming') l = l.filter((m) => m.status === 'upcoming');
    else if (filter === 'final') l = l.filter((m) => m.status === 'final');
    else if (filter === 'mine') l = l.filter((m) => m.home === team || m.away === team);
    return matchesByDay(l);
  }, [matches, filter, team]);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingBottom: 12 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingBottom: 14,
          }}
        >
          <Text style={{ fontSize: 27, color: t.text, letterSpacing: -0.6, ...f(800) }}>Matches</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
          {filters.map((fl) => (
            <FilterChip
              key={fl.id}
              active={filter === fl.id}
              dot={fl.dot}
              label={fl.label}
              onPress={() => setFilter(fl.id)}
            />
          ))}
        </ScrollView>
      </HeaderGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {days.length === 0 ? (
          <Text style={{ textAlign: 'center', color: t.faint, marginTop: 40, fontSize: 14, ...f(400) }}>
            No matches in this view.
          </Text>
        ) : null}
        {days.map((d) => (
          <View key={d.key} style={{ marginBottom: 22 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 2, marginBottom: 11 }}>
              <Text style={{ fontSize: 13, color: t.text, ...f(800) }}>{d.label}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: t.line }} />
              <Text style={{ fontSize: 11, color: t.faint, ...mono(700) }}>
                {d.matches.length} {d.matches.length === 1 ? 'MATCH' : 'MATCHES'}
              </Text>
            </View>
            <View style={{ gap: 9 }}>
              {d.matches.map((m) => (
                <MatchRow key={m.matchId} match={m} onOpen={(id) => router.push(`/match/${id}`)} showGroup />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
