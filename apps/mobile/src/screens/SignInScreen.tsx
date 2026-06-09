import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { authAdapter } from '../platform/signIn';

export function SignInScreen() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSignIn() {
    setBusy(true);
    setError(null);
    try {
      await authAdapter.signIn();
      // AuthProvider's onAuthStateChanged + the root layout handle navigation.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center bg-surface px-8">
      <Text className="mb-2 text-4xl font-extrabold text-primary">kickoff360</Text>
      <Text className="mb-12 text-base text-ink/60">Your World Cup companion</Text>

      <Pressable
        onPress={onSignIn}
        disabled={busy}
        className="w-full flex-row items-center justify-center rounded-2xl bg-primary px-6 py-4 active:opacity-80"
      >
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg font-semibold text-white">Continue with Google</Text>
        )}
      </Pressable>

      {error ? <Text className="mt-6 text-center text-red-600">{error}</Text> : null}
    </View>
  );
}
