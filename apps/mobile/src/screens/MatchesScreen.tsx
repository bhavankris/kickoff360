import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { matchesByDay, useMatches } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
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
      className={`flex-row items-center gap-1.5 rounded-full border px-3.5 py-2 ${
        active ? 'border-brand bg-brand' : 'border-line bg-surface'
      }`}
    >
      {dot ? <LiveDot size={6} color={active ? t.brandInk : t.live} /> : null}
      <Text className={`font-archivo-bold text-[13px] ${active ? 'text-brand-ink' : 'text-muted'}`}>{label}</Text>
    </Pressable>
  );
}

export function MatchesScreen() {
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
    <View className="flex-1 bg-canvas">
      <HeaderGradient style={{ paddingTop: insets.top + 10, paddingBottom: 12 }}>
        <View className="flex-row items-center justify-between px-5 pb-3.5">
          <Text className="font-archivo-extrabold text-[27px] tracking-[-0.6px] text-ink">Matches</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
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

      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-6">
        {days.length === 0 ? (
          <Text className="mt-10 text-center font-archivo text-[14px] text-faint">
            No matches in this view.
          </Text>
        ) : null}
        {days.map((d) => (
          <View key={d.key} className="mb-[22px]">
            <View className="mx-0.5 mb-[11px] flex-row items-center gap-2.5">
              <Text className="font-archivo-extrabold text-[13px] text-ink">{d.label}</Text>
              <View className="h-px flex-1 bg-line" />
              <Text className="font-mono-bold text-[11px] text-faint">
                {d.matches.length} {d.matches.length === 1 ? 'MATCH' : 'MATCHES'}
              </Text>
            </View>
            <View className="gap-[9px]">
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
