import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { completeOnboarding, COUNTRY_RGB } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';

// Phase 0 ships a handful of countries; Phase 1 adds all 48.
const COUNTRIES = Object.keys(COUNTRY_RGB).filter((c) => c !== 'DEFAULT');

export function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [countryCode, setCountryCode] = useState<string>('BRA');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = displayName.trim().length >= 1 && displayName.trim().length <= 40;

  async function onSave() {
    if (!user || !valid) return;
    setBusy(true);
    setError(null);
    try {
      await completeOnboarding(user.uid, {
        email: user.email ?? '',
        nameFromGoogle: user.displayName ?? '',
        displayName: displayName.trim(),
        countryCode,
      });
      await refreshProfile();
      // Root layout redirects to the app once status === 'ready'.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 justify-center bg-surface px-8">
      <Text className="mb-8 text-3xl font-bold text-ink">Set up your profile</Text>

      <Text className="mb-2 text-sm font-medium text-ink/70">Display name</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="How should we call you?"
        maxLength={40}
        className="mb-6 rounded-xl border border-ink/15 px-4 py-3 text-base text-ink"
      />

      <Text className="mb-2 text-sm font-medium text-ink/70">Supported country</Text>
      <View className="mb-8 flex-row flex-wrap gap-2">
        {COUNTRIES.map((cc) => {
          const selected = cc === countryCode;
          return (
            <Pressable
              key={cc}
              onPress={() => setCountryCode(cc)}
              className={`rounded-full border px-4 py-2 ${
                selected ? 'border-primary bg-primary' : 'border-ink/20 bg-transparent'
              }`}
            >
              <Text className={selected ? 'font-semibold text-white' : 'text-ink'}>{cc}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onSave}
        disabled={!valid || busy}
        className={`items-center rounded-2xl px-6 py-4 ${valid ? 'bg-primary' : 'bg-ink/20'}`}
      >
        {busy ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-lg font-semibold text-white">Continue</Text>
        )}
      </Pressable>

      {error ? <Text className="mt-6 text-center text-red-600">{error}</Text> : null}
    </View>
  );
}
