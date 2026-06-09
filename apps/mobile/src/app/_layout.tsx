import '../global.css';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/providers/AppProviders';
import { useAuth } from '@/providers/AuthProvider';

function RootNavigator() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    const group = segments[0]; // '(auth)' | '(onboarding)' | '(app)' | undefined

    if (status === 'signedOut' && group !== '(auth)') {
      router.replace('/(auth)/sign-in');
    } else if (status === 'needsOnboarding' && group !== '(onboarding)') {
      router.replace('/(onboarding)/profile-setup');
    } else if (status === 'ready' && group !== '(app)') {
      router.replace('/(app)');
    }
  }, [status, segments, router]);

  if (status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <RootNavigator />
    </AppProviders>
  );
}
