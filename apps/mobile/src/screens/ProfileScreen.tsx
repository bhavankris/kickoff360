import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { allTeams, completeOnboarding, teamFor, type Team } from '@repo/core';
import { authAdapter } from '../platform/signIn';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { usePrefs } from '../store/prefs';
import { Card, Flag, Icon, SectionTitle } from '../components/ui';
import { HeaderGradient } from '../components/HeaderGradient';

function TeamPicker({ current, onPick, onClose }: { current: string; onPick: (c: string) => void; onClose: () => void }) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const teams = useMemo(() => {
    const all = allTeams();
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((tm) => tm.name.toLowerCase().includes(needle) || tm.code.toLowerCase().includes(needle));
  }, [q]);

  const renderTeam = ({ item: tm }: { item: Team }) => {
    const sel = current === tm.code;
    return (
      <Pressable
        onPress={() => onPick(tm.code)}
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
      <HeaderGradient style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 14 }}>
        <View className="mb-3.5 flex-row items-center gap-3">
          <Pressable
            onPress={onClose}
            className="h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface"
          >
            <Icon name="back" size={20} color={t.text} />
          </Pressable>
          <Text className="font-archivo-extrabold text-[21px] text-ink">Change your team</Text>
        </View>
        <View className="h-[46px] flex-row items-center gap-2.5 rounded-[14px] border border-line bg-surface px-3.5">
          <Icon name="search" size={18} color={t.faint} />
          <TextInput
            value={q}
            onChangeText={setQ}
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
        contentContainerClassName="px-[13px] py-[9px]"
      />
    </View>
  );
}

function ToggleRow({
  icon,
  label,
  sub,
  on,
  onToggle,
}: {
  icon: string;
  label: string;
  sub?: string;
  on: boolean;
  onToggle: () => void;
}) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-[13px] px-1 py-[13px]">
      <Icon name={icon} size={20} color={t.muted} />
      <View className="flex-1">
        <Text className="font-archivo-semibold text-[14.5px] text-ink">{label}</Text>
        {sub ? <Text className="font-archivo text-[11.5px] text-faint">{sub}</Text> : null}
      </View>
      <View className={`h-[26px] w-11 rounded-full ${on ? 'bg-brand' : 'bg-surface3'}`}>
        <View className={`absolute top-[3px] h-5 w-5 rounded-full bg-white ${on ? 'left-[21px]' : 'left-[3px]'}`} />
      </View>
    </Pressable>
  );
}

function Segmented<V extends string>({
  value,
  options,
  onChange,
}: {
  value: V;
  options: [V, string][];
  onChange: (v: V) => void;
}) {
  return (
    <View className="flex-row gap-1.5 rounded-[10px] bg-surface2 p-[3px]">
      {options.map(([id, label]) => (
        <Pressable
          key={id}
          onPress={() => onChange(id)}
          className={`rounded-lg px-4 py-[7px] ${value === id ? 'bg-brand' : 'bg-transparent'}`}
        >
          <Text
            className={`font-archivo-extrabold text-[12.5px] ${value === id ? 'text-brand-ink' : 'text-muted'}`}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export function ProfileScreen() {
  const { t } = useTheme();
  const { user, profile, refreshProfile } = useAuth();
  const { mode, intensity, setMode, setIntensity } = usePrefs();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [picking, setPicking] = useState(false);
  const [notif, setNotif] = useState({ goals: true, lineups: true, news: false });

  const team = profile?.countryCode ?? 'BRA';
  const name = profile?.displayName ?? 'fan';
  const tm = teamFor(team);

  async function changeTeam(code: string) {
    setPicking(false);
    if (!user || !profile || code === team) return;
    await completeOnboarding(user.uid, {
      email: profile.email,
      nameFromGoogle: profile.nameFromGoogle,
      displayName: profile.displayName,
      countryCode: code,
    });
    await refreshProfile(); // re-themes the whole app
  }

  async function signOut() {
    await authAdapter.signOut();
    // AuthProvider flips to signedOut and the root layout redirects.
  }

  if (picking) return <TeamPicker current={team} onClose={() => setPicking(false)} onPick={changeTeam} />;

  return (
    <ScrollView className="flex-1 bg-canvas" contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <HeaderGradient style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 26 }}>
        <Pressable
          onPress={() => router.back()}
          className="absolute right-[18px] z-[2] h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface"
          style={{ top: insets.top + 12 }}
        >
          <Icon name="cross" size={18} color={t.text} />
        </Pressable>
        <View className="flex-row items-center gap-4">
          <View>
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-brand">
              <Text className="font-archivo-extrabold text-[30px] text-brand-ink">{name[0]?.toUpperCase()}</Text>
            </View>
            <View className="absolute -bottom-0.5 -right-0.5 overflow-hidden rounded-lg border-[3px] border-canvas">
              <Flag code={team} size={28} radius={6} />
            </View>
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-archivo-extrabold text-[23px] tracking-[-0.4px] text-ink">{name}</Text>
            <Text className="font-archivo text-[13px] text-muted">{tm?.name} supporter</Text>
            <Text className="mt-[3px] font-mono text-[11px] text-faint">
              SUPPORTER #2026-{team}
            </Text>
          </View>
        </View>
      </HeaderGradient>

      <View className="gap-5 px-4 pt-[18px]">
        <View>
          <SectionTitle>Your Team</SectionTitle>
          <Card pad={6}>
            <Pressable
              onPress={() => setPicking(true)}
              className="flex-row items-center gap-[13px] px-2.5 py-[11px]"
            >
              <Flag code={team} size={36} />
              <View className="flex-1">
                <Text className="font-archivo-extrabold text-[15px] text-ink">{tm?.name}</Text>
                <Text className="font-archivo text-[12px] text-faint">Group {tm?.group} · Tap to change</Text>
              </View>
              <Icon name="chevron" size={18} color={t.faint} />
            </Pressable>
          </Card>
        </View>

        <View>
          <SectionTitle>App Theme</SectionTitle>
          <Card pad={16}>
            <Text className="mb-3 font-archivo text-[13px] text-muted">
              How much should {tm?.name}&apos;s colors take over?
            </Text>
            <View className="flex-row gap-2 rounded-xl bg-surface2 p-1">
              {(
                [
                  ['subtle', 'Subtle'],
                  ['full', 'Full takeover'],
                ] as const
              ).map(([id, label]) => (
                <Pressable
                  key={id}
                  onPress={() => setIntensity(id)}
                  className={`flex-1 items-center rounded-[9px] py-[9px] ${
                    intensity === id ? 'bg-brand' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-archivo-extrabold text-[13px] ${
                      intensity === id ? 'text-brand-ink' : 'text-muted'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        <View>
          <SectionTitle>Appearance</SectionTitle>
          <Card pad={14}>
            <View className="flex-row items-center gap-[11px]">
              <Icon name={mode === 'light' ? 'globe' : 'star'} size={19} color={t.muted} />
              <Text className="flex-1 font-archivo-semibold text-[14px] text-ink">Appearance</Text>
              <Segmented
                value={mode}
                options={[
                  ['dark', 'Dark'],
                  ['light', 'Light'],
                ]}
                onChange={setMode}
              />
            </View>
          </Card>
        </View>

        <View>
          <SectionTitle>Notifications</SectionTitle>
          <Card pad={10}>
            <ToggleRow
              icon="bolt"
              label="Goal alerts"
              sub="Every goal, your team & live matches"
              on={notif.goals}
              onToggle={() => setNotif((n) => ({ ...n, goals: !n.goals }))}
            />
            <View className="h-px bg-line" />
            <ToggleRow
              icon="shirt"
              label="Lineups"
              sub="1 hour before kick-off"
              on={notif.lineups}
              onToggle={() => setNotif((n) => ({ ...n, lineups: !n.lineups }))}
            />
            <View className="h-px bg-line" />
            <ToggleRow
              icon="globe"
              label="Team news"
              sub="Injuries, transfers & press"
              on={notif.news}
              onToggle={() => setNotif((n) => ({ ...n, news: !n.news }))}
            />
          </Card>
        </View>

        <Pressable
          onPress={signOut}
          className="h-[50px] items-center justify-center rounded-[14px] border border-line bg-surface"
        >
          <Text className="font-archivo-extrabold text-[14.5px] text-[#ff6b6f]">Sign out</Text>
        </Pressable>
        <Text className="text-center font-mono text-[11px] tracking-[0.5px] text-faint">
          KICKOFF360 · v1.0
        </Text>
      </View>
    </ScrollView>
  );
}
