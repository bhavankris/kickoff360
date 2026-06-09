import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { allTeams, completeOnboarding, teamFor, type Team } from '@repo/core';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { usePrefs } from '../store/prefs';
import { f, mono } from '../theme/fonts';
import { Flag, Icon, Pill } from '../components/ui';
import { HeaderGradient } from '../components/HeaderGradient';

/**
 * Onboarding steps 1–2: display name, then pick your nation from all 48 with
 * the screen re-theming live as you tap (via prefs.previewTeam → ThemeProvider).
 */
export function ProfileSetupScreen() {
  const { user, refreshProfile } = useAuth();
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const setPreviewTeam = usePrefs((s) => s.setPreviewTeam);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState(user?.displayName ?? '');
  const [query, setQuery] = useState('');
  const [pick, setPick] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teams = useMemo(() => {
    const all = allTeams();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((tm) => tm.name.toLowerCase().includes(q) || tm.code.toLowerCase().includes(q));
  }, [query]);

  const valid = name.trim().length >= 1 && name.trim().length <= 24;

  function choose(code: string) {
    setPick(code);
    setPreviewTeam(code); // live re-theme
  }

  async function onComplete() {
    if (!user || !valid || !pick) return;
    setBusy(true);
    setError(null);
    try {
      await completeOnboarding(user.uid, {
        email: user.email ?? '',
        nameFromGoogle: user.displayName ?? '',
        displayName: name.trim(),
        countryCode: pick,
      });
      await refreshProfile();
      setPreviewTeam(null); // profile.countryCode now drives the theme
      // Root layout redirects to the app once status === 'ready'.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setBusy(false);
    }
  }

  // ── Step 1: display name ──────────────────────────────────────
  if (step === 1) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          paddingTop: insets.top + 28,
          paddingHorizontal: 30,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Pill bg={t.brandSoft} color={t.brandText}>Step 1 of 2</Pill>
        <Text style={{ fontSize: 34, letterSpacing: -0.8, color: t.text, marginTop: 16, marginBottom: 8, ...f(800) }}>
          What should we call you?
        </Text>
        <Text style={{ fontSize: 15, color: t.muted, marginBottom: 28, lineHeight: 22, ...f(400) }}>
          This is your supporter name on predictions and leaderboards.
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: t.brand,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 22, color: t.brandInk, ...f(800) }}>
              {(name.trim()[0] ?? 'A').toUpperCase()}
            </Text>
          </View>
          <View style={{ minWidth: 0, flex: 1 }}>
            <Text style={{ fontSize: 12, color: t.faint, ...mono(400) }}>SIGNED IN AS</Text>
            <Text numberOfLines={1} style={{ fontSize: 14, color: t.muted, ...f(400) }}>
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: t.faint, letterSpacing: 0.6, textTransform: 'uppercase', ...mono(700) }}>
          Display name
        </Text>
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={t.faint}
          maxLength={24}
          style={{
            marginTop: 8,
            height: 56,
            borderRadius: 16,
            paddingHorizontal: 16,
            backgroundColor: t.surface,
            borderWidth: 1.5,
            borderColor: t.brandLine,
            color: t.text,
            fontSize: 18,
            ...f(600),
          }}
        />

        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => valid && setStep(2)}
          disabled={!valid}
          style={{
            height: 56,
            borderRadius: 16,
            backgroundColor: valid ? t.brand : t.surface2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ color: valid ? t.brandInk : t.faint, fontSize: 16, ...f(800) }}>Continue</Text>
          <Icon name="chevron" size={18} sw={2.6} color={valid ? t.brandInk : t.faint} />
        </Pressable>
      </View>
    );
  }

  // ── Step 2: pick your nation ──────────────────────────────────
  const renderTeam = ({ item: tm }: { item: Team }) => {
    const sel = pick === tm.code;
    return (
      <Pressable
        onPress={() => choose(tm.code)}
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 11,
          paddingHorizontal: 12,
          borderRadius: 14,
          backgroundColor: sel ? t.brandSoft : t.surface,
          borderWidth: 1.5,
          borderColor: sel ? t.brandText : t.line,
          margin: 5,
        }}
      >
        <Flag code={tm.code} size={30} />
        <View style={{ minWidth: 0, flex: 1 }}>
          <Text numberOfLines={1} style={{ fontSize: 14, color: t.text, ...f(700) }}>
            {tm.name}
          </Text>
          <Text style={{ fontSize: 11, color: t.faint, ...mono(400) }}>GROUP {tm.group}</Text>
        </View>
        {sel ? <Icon name="check" size={17} color={t.brandText} sw={2.8} /> : null}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <HeaderGradient style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 14 }}>
        <Pressable
          onPress={() => setStep(1)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}
        >
          <Icon name="back" size={20} color={t.muted} />
          <Text style={{ fontSize: 14, color: t.muted, ...f(600) }}>Back</Text>
        </Pressable>
        <Pill bg={t.brandSoft} color={t.brandText}>Step 2 of 2</Pill>
        <Text style={{ fontSize: 30, letterSpacing: -0.6, color: t.text, marginTop: 12, marginBottom: 4, ...f(800) }}>
          Pick your nation
        </Text>
        <Text style={{ fontSize: 14, color: t.muted, marginBottom: 14, ...f(400) }}>
          The whole app takes on their colors. Change it anytime.
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.line,
            borderRadius: 14,
            paddingHorizontal: 14,
            height: 46,
          }}
        >
          <Icon name="search" size={18} color={t.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search 48 teams"
            placeholderTextColor={t.faint}
            style={{ flex: 1, color: t.text, fontSize: 15, ...f(500) }}
          />
        </View>
      </HeaderGradient>

      <FlatList
        data={teams}
        numColumns={2}
        keyExtractor={(tm) => tm.code}
        renderItem={renderTeam}
        contentContainerStyle={{ paddingHorizontal: 13, paddingTop: 9, paddingBottom: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: t.faint, marginTop: 30, fontSize: 14, ...f(400) }}>
            No teams match “{query}”.
          </Text>
        }
      />

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: insets.bottom + 16,
          backgroundColor: t.surface,
          borderTopWidth: 1,
          borderTopColor: t.line,
        }}
      >
        {error ? (
          <Text style={{ marginBottom: 8, textAlign: 'center', color: t.live, fontSize: 13, ...f(600) }}>{error}</Text>
        ) : null}
        <Pressable
          onPress={onComplete}
          disabled={!pick || busy}
          style={{
            height: 56,
            borderRadius: 16,
            backgroundColor: pick ? t.brand : t.surface2,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 9,
          }}
        >
          {busy ? (
            <ActivityIndicator color={t.brandInk} />
          ) : (
            <>
              <Text style={{ color: pick ? t.brandInk : t.faint, fontSize: 16, ...f(800) }}>
                {pick ? `Enter as a ${teamFor(pick)?.name} fan` : 'Select a team to continue'}
              </Text>
              {pick ? <Icon name="chevron" size={18} sw={2.6} color={t.brandInk} /> : null}
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}
