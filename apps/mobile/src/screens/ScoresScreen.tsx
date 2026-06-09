import { View, Text } from 'react-native';

// Phase 1: live scores via useFirestoreSubscription (core) bridging onSnapshot.
export function ScoresScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="text-2xl font-bold text-ink">Live Scores</Text>
      <Text className="mt-2 text-center text-ink/50">
        Coming in Phase 1 — live updates via the shared Firestore subscription hook.
      </Text>
    </View>
  );
}
