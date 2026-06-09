import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useFixtures, type FixtureDoc } from '@repo/core';
import { useUiStore } from '../store/ui';

function FixtureRow({ fixture }: { fixture: FixtureDoc }) {
  const { teams, goals, status } = fixture;
  const score =
    goals.home === null || goals.away === null ? 'vs' : `${goals.home} – ${goals.away}`;
  return (
    <View className="mb-2 flex-row items-center justify-between rounded-xl border border-ink/10 bg-secondary/40 px-4 py-3">
      <Text className="flex-1 text-right text-ink" numberOfLines={1}>
        {teams.home.name}
      </Text>
      <Text className="mx-4 font-bold text-primary">{score}</Text>
      <Text className="flex-1 text-ink" numberOfLines={1}>
        {teams.away.name}
      </Text>
      <Text className="ml-3 w-10 text-xs text-ink/50">{status.short}</Text>
    </View>
  );
}

export function ScheduleScreen() {
  const selectedDate = useUiStore((s) => s.selectedDate);
  const { data, isLoading, isError, error } = useFixtures(selectedDate);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="rgb(var(--c-primary))" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-8">
        <Text className="text-center text-red-600">
          {error instanceof Error ? error.message : 'Failed to load fixtures'}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface px-4 pt-4">
      <Text className="mb-4 text-2xl font-bold text-ink">Schedule</Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(f) => String(f.fixtureId)}
        renderItem={({ item }) => <FixtureRow fixture={item} />}
        ListEmptyComponent={
          <Text className="mt-12 text-center text-ink/50">No fixtures for {selectedDate}.</Text>
        }
      />
    </View>
  );
}
