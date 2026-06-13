import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../providers/ThemeProvider';

/** The team-tinted header wash used behind screen headers and hero cards. */
export function HeaderGradient({
  children,
  style,
}: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTheme();
  return (
    <LinearGradient
      colors={[t.headerFrom, t.headerTo]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.6, y: 1 }}
      style={style}
    >
      {children}
    </LinearGradient>
  );
}
