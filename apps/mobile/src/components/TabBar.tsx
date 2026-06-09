import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMatches } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
import { f } from '../theme/fonts';
import { Icon } from './ui';

/**
 * Structural subset of react-navigation's BottomTabBarProps — Expo Router 56
 * vendors bottom-tabs internally, so the upstream type isn't importable.
 */
interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

const ITEMS: Record<string, { icon: string; label: string; center?: boolean }> = {
  index: { icon: 'home', label: 'Home' },
  matches: { icon: 'calendar', label: 'Matches' },
  live: { icon: 'flame', label: 'Live', center: true },
  groups: { icon: 'trophy', label: 'Groups' },
  players: { icon: 'chart', label: 'Players' },
};

/** Bottom navigation with the raised Live button + live-count badge. */
export function TabBar({ state, navigation }: TabBarProps) {
  const { t } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: matches = [] } = useMatches();
  const liveCount = matches.filter((m) => m.status === 'live').length;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingTop: 8,
        paddingHorizontal: 10,
        paddingBottom: insets.bottom + 8,
        backgroundColor: t.surface,
        borderTopWidth: 1,
        borderTopColor: t.line,
      }}
    >
      {state.routes.map((route, index) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const active = state.index === index;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (item.center) {
          return (
            <Pressable key={route.key} onPress={onPress} style={{ alignItems: 'center', gap: 5, marginTop: -26 }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 20,
                  backgroundColor: t.live,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="flame" size={26} color="#fff" fill="rgba(255,255,255,0.18)" sw={2} />
                {liveCount > 0 ? (
                  <View
                    style={{
                      position: 'absolute',
                      top: -3,
                      right: -3,
                      minWidth: 19,
                      height: 19,
                      paddingHorizontal: 5,
                      borderRadius: 10,
                      backgroundColor: '#fff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: t.surface,
                    }}
                  >
                    <Text style={{ color: t.live, fontSize: 11, ...f(800) }}>{liveCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={{ fontSize: 10, color: t.live, letterSpacing: 0.2, ...f(800) }}>{item.label}</Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={{ alignItems: 'center', gap: 5, paddingVertical: 2, paddingHorizontal: 6, width: 64 }}
          >
            <Icon
              name={item.icon}
              size={23}
              color={active ? t.brandText : t.faint}
              sw={active ? 2.2 : 1.9}
              fill={active ? t.brandSoft : 'none'}
            />
            <Text style={{ fontSize: 10, color: active ? t.brandText : t.faint, letterSpacing: 0.1, ...f(active ? 800 : 600) }}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
