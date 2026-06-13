import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { authAdapter } from '../platform/signIn';
import { devSignIn } from '../lib/devAuth';
import { useTheme } from '../providers/ThemeProvider';
import { Icon } from '../components/ui';

function GoogleG({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.5 2.6 30.1 0 24 0 14.6 0 6.4 5.4 2.6 13.2l7.8 6.1C12.2 13.3 17.6 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.7-9.9 6.7-17.4z" />
      <Path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C.9 16 0 19.9 0 24s.9 8 2.6 11.4l7.8-7.1z" />
      <Path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.3-5.7c-2 1.4-4.7 2.3-7.7 2.3-6.4 0-11.8-3.8-13.6-9.8l-7.8 7.1C6.4 42.6 14.6 48 24 48z" />
    </Svg>
  );
}

function PitchLines({ stroke }: { stroke: string }) {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 412 400" preserveAspectRatio="xMidYMid slice">
      <Circle cx="206" cy="200" r="78" fill="none" stroke={stroke} strokeWidth="1.4" />
      <Line x1="0" y1="200" x2="412" y2="200" stroke={stroke} strokeWidth="1.4" />
      <Rect x="86" y="-60" width="240" height="120" rx="2" fill="none" stroke={stroke} strokeWidth="1.4" />
      <Rect x="146" y="-60" width="120" height="60" fill="none" stroke={stroke} strokeWidth="1.4" />
      <Rect x="86" y="340" width="240" height="120" rx="2" fill="none" stroke={stroke} strokeWidth="1.4" />
      <Circle cx="206" cy="200" r="3" fill={stroke} />
    </Svg>
  );
}

export function SignInScreen() {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
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

  async function onDevSignIn() {
    setBusy(true);
    setError(null);
    try {
      await devSignIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dev sign-in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-canvas">
      <View className="absolute -top-10 left-0 right-0 h-[460px] opacity-50">
        <PitchLines stroke={t.line2} />
      </View>

      <View className="flex-1 justify-end px-[30px] pb-4">
        <View className="mb-[22px] flex-row items-center gap-[9px]">
          <View className="h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-brand">
            <Icon name="flame" size={20} color={t.brandInk} fill={t.brandInk} sw={1.6} />
          </View>
          <Text className="font-mono-bold text-[13px] uppercase tracking-[2px] text-ink">
            kickoff<Text className="text-brand-text">360</Text>
          </Text>
        </View>
        <Text className="mb-3.5 font-archivo-extrabold text-[46px] leading-[47px] tracking-[-1.5px] text-ink">
          Your World Cup,{'\n'}
          <Text className="text-brand-text">your colors.</Text>
        </Text>
        <Text className="mb-1 max-w-[320px] font-archivo text-[16px] leading-[23px] text-muted">
          Live scores, lineups, group tables and golden-boot races — for all 48 nations, themed to the team you
          bleed for.
        </Text>
      </View>

      <View className="px-6 pt-3.5" style={{ paddingBottom: insets.bottom + 28 }}>
        <Pressable
          onPress={onSignIn}
          disabled={busy}
          className="h-14 flex-row items-center justify-center gap-3 rounded-2xl bg-white"
        >
          {busy ? (
            <>
              <ActivityIndicator color="#1f1f1f" />
              <Text className="font-archivo-bold text-[16px] text-[#1f1f1f]">Signing in…</Text>
            </>
          ) : (
            <>
              <GoogleG size={20} />
              <Text className="font-archivo-bold text-[16px] text-[#1f1f1f]">Continue with Google</Text>
            </>
          )}
        </Pressable>
        {__DEV__ ? (
          <Pressable
            onPress={onDevSignIn}
            disabled={busy}
            style={{
              height: 52,
              borderRadius: 16,
              marginTop: 12,
              borderWidth: 1,
              borderColor: t.line2,
              borderStyle: 'dashed',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <Icon name="flame" size={16} color={t.muted} sw={1.6} />
            <Text className="font-archivo-bold text-[14px] text-muted">Dev: continue without Google</Text>
          </Pressable>
        ) : null}
        {error ? (
          <Text className="mt-3 text-center font-archivo-semibold text-[13px] text-live">{error}</Text>
        ) : null}
        <Text className="mt-4 text-center font-mono text-[11.5px] leading-[17px] tracking-[0.2px] text-faint">
          48 NATIONS · 104 MATCHES · 16 STADIUMS{'\n'}By continuing you agree to the Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}
