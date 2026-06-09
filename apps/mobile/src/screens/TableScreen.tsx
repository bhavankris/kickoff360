import { View, Text } from 'react-native';

// Phase 1: standings from the `standings` collection (populated by pollStandings).
export function TableScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-2xl font-bold text-ink">Points Table</Text>
      <Text className="mt-2 text-center text-ink/50">Coming in Phase 1.</Text>
    </View>
  );
}
