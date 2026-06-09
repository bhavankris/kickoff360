import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';
import { authAdapter } from '../platform/signIn';
import { useTheme } from '../providers/ThemeProvider';
import { f, mono } from '../theme/fonts';
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

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ position: 'absolute', top: -40, left: 0, right: 0, height: 460, opacity: 0.5 }}>
        <PitchLines stroke={t.line2} />
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: 30, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 22 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="flame" size={20} color={t.brandInk} fill={t.brandInk} sw={1.6} />
          </View>
          <Text style={{ fontSize: 13, letterSpacing: 2, color: t.text, textTransform: 'uppercase', ...mono(700) }}>
            kickoff<Text style={{ color: t.brandText }}>360</Text>
          </Text>
        </View>
        <Text style={{ fontSize: 46, lineHeight: 47, letterSpacing: -1.5, color: t.text, marginBottom: 14, ...f(800) }}>
          Your World Cup,{'\n'}
          <Text style={{ color: t.brandText }}>your colors.</Text>
        </Text>
        <Text style={{ fontSize: 16, color: t.muted, marginBottom: 4, maxWidth: 320, lineHeight: 23, ...f(400) }}>
          Live scores, lineups, group tables and golden-boot races — for all 48 nations, themed to the team you
          bleed for.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: insets.bottom + 28 }}>
        <Pressable
          onPress={onSignIn}
          disabled={busy}
          style={{
            height: 56,
            borderRadius: 16,
            backgroundColor: '#fff',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          {busy ? (
            <>
              <ActivityIndicator color="#1f1f1f" />
              <Text style={{ color: '#1f1f1f', fontSize: 16, ...f(700) }}>Signing in…</Text>
            </>
          ) : (
            <>
              <GoogleG size={20} />
              <Text style={{ color: '#1f1f1f', fontSize: 16, ...f(700) }}>Continue with Google</Text>
            </>
          )}
        </Pressable>
        {error ? (
          <Text style={{ marginTop: 12, textAlign: 'center', color: t.live, fontSize: 13, ...f(600) }}>{error}</Text>
        ) : null}
        <Text
          style={{
            textAlign: 'center',
            fontSize: 11.5,
            color: t.faint,
            marginTop: 16,
            lineHeight: 17,
            letterSpacing: 0.2,
            ...mono(400),
          }}
        >
          48 NATIONS · 104 MATCHES · 16 STADIUMS{'\n'}By continuing you agree to the Terms & Privacy Policy
        </Text>
      </View>
    </View>
  );
}
