import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { computeTheme, type ThemeTokens } from '@repo/core';
import { useAuth } from './AuthProvider';
import { usePrefs } from '../store/prefs';

/**
 * Applies the fan's team theme app-wide. The favourite team comes from the
 * Firestore profile (or the onboarding preview pick); mode + intensity are
 * local appearance prefs. Screens read the resolved tokens via useTheme().
 */

interface ThemeContextValue {
  t: ThemeTokens;
  /** Favourite-team code driving the theme (null pre-onboarding). */
  teamCode: string | null;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const { mode, intensity, previewTeam } = usePrefs();
  const teamCode = profile?.countryCode ?? previewTeam;

  const t = useMemo(() => computeTheme(teamCode, { mode, intensity }), [teamCode, mode, intensity]);

  return (
    <ThemeContext.Provider value={{ t, teamCode }}>
      <View style={{ flex: 1, backgroundColor: t.bg }}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
