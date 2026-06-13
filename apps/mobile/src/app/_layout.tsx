import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { AppProviders } from '@/providers/AppProviders';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { FONTS } from '@/theme/fonts';

function RootNavigator() {
  const { status } = useAuth();
  const { t } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts(FONTS);

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

  if (status === 'loading' || !fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color={t.brandText} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={t.mode === 'light' ? 'dark' : 'light'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
