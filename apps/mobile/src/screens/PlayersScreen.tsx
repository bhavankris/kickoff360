import { View, Text } from 'react-native';

// Phase 1: top players from the `players` collection (populated by pollTopPlayers).
export function PlayersScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-2xl font-bold text-ink">Top Players</Text>
      <Text className="mt-2 text-center text-ink/50">Coming in Phase 1.</Text>
    </View>
  );
}
