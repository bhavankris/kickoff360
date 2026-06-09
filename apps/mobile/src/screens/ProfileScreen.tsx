import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { allTeams, completeOnboarding, teamFor, type Team } from '@repo/core';
import { authAdapter } from '../platform/signIn';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';
import { usePrefs } from '../store/prefs';
import { f, mono } from '../theme/fonts';
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
      <HeaderGradient style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Pressable
            onPress={onClose}
            style={{
              backgroundColor: t.surface,
              borderWidth: 1,
              borderColor: t.line,
              width: 40,
              height: 40,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="back" size={20} color={t.text} />
          </Pressable>
          <Text style={{ fontSize: 21, color: t.text, ...f(800) }}>Change your team</Text>
        </View>
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
            value={q}
            onChangeText={setQ}
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
        contentContainerStyle={{ paddingHorizontal: 13, paddingVertical: 9 }}
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
    <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, paddingHorizontal: 4 }}>
      <Icon name={icon} size={20} color={t.muted} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14.5, color: t.text, ...f(600) }}>{label}</Text>
        {sub ? <Text style={{ fontSize: 11.5, color: t.faint, ...f(400) }}>{sub}</Text> : null}
      </View>
      <View
        style={{ width: 44, height: 26, borderRadius: 100, backgroundColor: on ? t.brand : t.surface3 }}
      >
        <View
          style={{
            position: 'absolute',
            top: 3,
            left: on ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#fff',
          }}
        />
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
  const { t } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 6, backgroundColor: t.surface2, borderRadius: 10, padding: 3 }}>
      {options.map(([id, label]) => (
        <Pressable
          key={id}
          onPress={() => onChange(id)}
          style={{
            paddingVertical: 7,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: value === id ? t.brand : 'transparent',
          }}
        >
          <Text style={{ color: value === id ? t.brandInk : t.muted, fontSize: 12.5, ...f(800) }}>{label}</Text>
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
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
      <HeaderGradient style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 26 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: insets.top + 12,
            right: 18,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.line,
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Icon name="cross" size={18} color={t.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: t.brand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 30, color: t.brandInk, ...f(800) }}>{name[0]?.toUpperCase()}</Text>
            </View>
            <View
              style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                borderWidth: 3,
                borderColor: t.bg,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <Flag code={team} size={28} radius={6} />
            </View>
          </View>
          <View style={{ minWidth: 0, flex: 1 }}>
            <Text style={{ fontSize: 23, color: t.text, letterSpacing: -0.4, ...f(800) }}>{name}</Text>
            <Text style={{ fontSize: 13, color: t.muted, ...f(400) }}>{tm?.name} supporter</Text>
            <Text style={{ fontSize: 11, color: t.faint, marginTop: 3, ...mono(400) }}>
              SUPPORTER #2026-{team}
            </Text>
          </View>
        </View>
      </HeaderGradient>

      <View style={{ paddingTop: 18, paddingHorizontal: 16, gap: 20 }}>
        <View>
          <SectionTitle>Your Team</SectionTitle>
          <Card pad={6}>
            <Pressable
              onPress={() => setPicking(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 11, paddingHorizontal: 10 }}
            >
              <Flag code={team} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: t.text, ...f(800) }}>{tm?.name}</Text>
                <Text style={{ fontSize: 12, color: t.faint, ...f(400) }}>Group {tm?.group} · Tap to change</Text>
              </View>
              <Icon name="chevron" size={18} color={t.faint} />
            </Pressable>
          </Card>
        </View>

        <View>
          <SectionTitle>App Theme</SectionTitle>
          <Card pad={16}>
            <Text style={{ fontSize: 13, color: t.muted, marginBottom: 12, ...f(400) }}>
              How much should {tm?.name}&apos;s colors take over?
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, backgroundColor: t.surface2, borderRadius: 12, padding: 4 }}>
              {(
                [
                  ['subtle', 'Subtle'],
                  ['full', 'Full takeover'],
                ] as const
              ).map(([id, label]) => (
                <Pressable
                  key={id}
                  onPress={() => setIntensity(id)}
                  style={{
                    flex: 1,
                    paddingVertical: 9,
                    borderRadius: 9,
                    alignItems: 'center',
                    backgroundColor: intensity === id ? t.brand : 'transparent',
                  }}
                >
                  <Text style={{ color: intensity === id ? t.brandInk : t.muted, fontSize: 13, ...f(800) }}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>

        <View>
          <SectionTitle>Appearance</SectionTitle>
          <Card pad={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
              <Icon name={mode === 'light' ? 'globe' : 'star'} size={19} color={t.muted} />
              <Text style={{ flex: 1, fontSize: 14, color: t.text, ...f(600) }}>Appearance</Text>
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
            <View style={{ height: 1, backgroundColor: t.line }} />
            <ToggleRow
              icon="shirt"
              label="Lineups"
              sub="1 hour before kick-off"
              on={notif.lineups}
              onToggle={() => setNotif((n) => ({ ...n, lineups: !n.lineups }))}
            />
            <View style={{ height: 1, backgroundColor: t.line }} />
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
          style={{
            height: 50,
            borderRadius: 14,
            backgroundColor: t.surface,
            borderWidth: 1,
            borderColor: t.line,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#ff6b6f', fontSize: 14.5, ...f(800) }}>Sign out</Text>
        </Pressable>
        <Text style={{ textAlign: 'center', fontSize: 11, color: t.faint, letterSpacing: 0.5, ...mono(400) }}>
          KICKOFF360 · v1.0
        </Text>
      </View>
    </ScrollView>
  );
}
