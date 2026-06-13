import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMatches } from '@repo/core';
import { useTheme } from '../providers/ThemeProvider';
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
      className="flex-row items-end justify-around border-t border-t-line bg-surface px-2.5 pt-2"
      style={{ paddingBottom: insets.bottom + 8 }}
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
            <Pressable key={route.key} onPress={onPress} className="-mt-[26px] items-center gap-[5px]">
              <View className="h-14 w-14 items-center justify-center rounded-[20px] bg-live">
                <Icon name="flame" size={26} color="#fff" fill="rgba(255,255,255,0.18)" sw={2} />
                {liveCount > 0 ? (
                  <View className="absolute -right-[3px] -top-[3px] h-[19px] min-w-[19px] items-center justify-center rounded-[10px] border-2 border-surface bg-white px-[5px]">
                    <Text className="font-archivo-extrabold text-[11px] text-live">{liveCount}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                numberOfLines={1}
                className="font-archivo-extrabold text-[10px] tracking-[0.2px] text-live"
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable key={route.key} onPress={onPress} className="flex-1 items-center gap-[5px] px-0.5 py-0.5">
            <Icon
              name={item.icon}
              size={23}
              color={active ? t.brandText : t.faint}
              sw={active ? 2.2 : 1.9}
              fill={active ? t.brandSoft : 'none'}
            />
            <Text
              numberOfLines={1}
              className={`text-[10px] tracking-[0.1px] ${
                active ? 'font-archivo-extrabold text-brand-text' : 'font-archivo-semibold text-faint'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
