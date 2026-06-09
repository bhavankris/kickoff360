import { type ReactNode } from 'react';
import { View } from 'react-native';
import { themeFor } from '../theme/vars';
import { useAuth } from './AuthProvider';

/**
 * Applies the signed-in user's country palette by setting CSS variables on a
 * full-screen wrapper. Everything below can use className="bg-primary text-ink"
 * and it re-tints when the user's countryCode changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  return (
    <View style={themeFor(profile?.countryCode)} className="flex-1 bg-surface">
      {children}
    </View>
  );
}
