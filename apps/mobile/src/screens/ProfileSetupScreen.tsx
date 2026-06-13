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
        className="flex-1 bg-canvas px-[30px]"
        style={{
          paddingTop: insets.top + 28,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Pill className="bg-brand-soft" textClassName="text-brand-text">Step 1 of 2</Pill>
        <Text className="mb-2 mt-4 font-archivo-extrabold text-[34px] tracking-[-0.8px] text-ink">
          What should we call you?
        </Text>
        <Text className="mb-7 font-archivo text-[15px] leading-[22px] text-muted">
          This is your supporter name on predictions and leaderboards.
        </Text>

        <View className="mb-[22px] flex-row items-center gap-3">
          <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-brand">
            <Text className="font-archivo-extrabold text-[22px] text-brand-ink">
              {(name.trim()[0] ?? 'A').toUpperCase()}
            </Text>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-mono text-[12px] text-faint">SIGNED IN AS</Text>
            <Text numberOfLines={1} className="font-archivo text-[14px] text-muted">
              {user?.email ?? ''}
            </Text>
          </View>
        </View>

        <Text className="font-mono-bold text-[12px] uppercase tracking-[0.6px] text-faint">
          Display name
        </Text>
        <TextInput
          autoFocus
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={t.faint}
          maxLength={24}
          className="mt-2 h-14 rounded-2xl border-[1.5px] border-brand-line bg-surface px-4 font-archivo-semibold text-[18px] text-ink"
        />

        <View className="flex-1" />
        <Pressable
          onPress={() => valid && setStep(2)}
          disabled={!valid}
          className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl ${
            valid ? 'bg-brand' : 'bg-surface2'
          }`}
        >
          <Text className={`font-archivo-extrabold text-[16px] ${valid ? 'text-brand-ink' : 'text-faint'}`}>
            Continue
          </Text>
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
        className={`m-[5px] flex-1 flex-row items-center gap-2.5 rounded-[14px] border-[1.5px] px-3 py-[11px] ${
          sel ? 'border-brand-text bg-brand-soft' : 'border-line bg-surface'
        }`}
      >
        <Flag code={tm.code} size={30} />
        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-archivo-bold text-[14px] text-ink">
            {tm.name}
          </Text>
          <Text className="font-mono text-[11px] text-faint">GROUP {tm.group}</Text>
        </View>
        {sel ? <Icon name="check" size={17} color={t.brandText} sw={2.8} /> : null}
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-canvas">
      <HeaderGradient style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 14 }}>
        <Pressable
          onPress={() => setStep(1)}
          className="mb-3.5 flex-row items-center gap-1"
        >
          <Icon name="back" size={20} color={t.muted} />
          <Text className="font-archivo-semibold text-[14px] text-muted">Back</Text>
        </Pressable>
        <Pill className="bg-brand-soft" textClassName="text-brand-text">Step 2 of 2</Pill>
        <Text className="mb-1 mt-3 font-archivo-extrabold text-[30px] tracking-[-0.6px] text-ink">
          Pick your nation
        </Text>
        <Text className="mb-3.5 font-archivo text-[14px] text-muted">
          The whole app takes on their colors. Change it anytime.
        </Text>
        <View className="h-[46px] flex-row items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3.5">
          <Icon name="search" size={18} color={t.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search 48 teams"
            placeholderTextColor={t.faint}
            className="flex-1 font-archivo-medium text-[15px] text-ink"
          />
        </View>
      </HeaderGradient>

      <FlatList
        data={teams}
        numColumns={2}
        keyExtractor={(tm) => tm.code}
        renderItem={renderTeam}
        contentContainerClassName="px-[13px] pb-2.5 pt-[9px]"
        ListEmptyComponent={
          <Text className="mt-[30px] text-center font-archivo text-[14px] text-faint">
            No teams match “{query}”.
          </Text>
        }
      />

      <View
        className="border-t border-t-line bg-surface px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        {error ? (
          <Text className="mb-2 text-center font-archivo-semibold text-[13px] text-live">{error}</Text>
        ) : null}
        <Pressable
          onPress={onComplete}
          disabled={!pick || busy}
          className={`h-14 flex-row items-center justify-center gap-[9px] rounded-2xl ${
            pick ? 'bg-brand' : 'bg-surface2'
          }`}
        >
          {busy ? (
            <ActivityIndicator color={t.brandInk} />
          ) : (
            <>
              <Text className={`font-archivo-extrabold text-[16px] ${pick ? 'text-brand-ink' : 'text-faint'}`}>
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
