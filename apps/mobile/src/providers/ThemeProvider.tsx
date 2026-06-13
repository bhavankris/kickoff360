import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { View } from 'react-native';
import { vars } from 'nativewind';
import { computeTheme, type ThemeTokens } from '@repo/core';
import { useAuth } from './AuthProvider';
import { usePrefs } from '../store/prefs';

/**
 * Applies the fan's team theme app-wide. The favourite team comes from the
 * Firestore profile (or the onboarding preview pick); mode + intensity are
 * local appearance prefs.
 *
 * The resolved tokens are published as CSS variables via NativeWind vars(),
 * so screens style with utility classes (`bg-surface`, `text-ink`,
 * `border-line`, `text-brand-text`, …) and re-tint automatically. Reach for
 * `useTheme().t` only where a raw color string is unavoidable: SVG props,
 * gradient stops, ActivityIndicator/StatusBar, Animated values.
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

  // Names must stay in sync with tailwind.config.js + global.css.
  const themeVars = useMemo(
    () =>
      vars({
        '--c-bg': t.bg,
        '--c-surface': t.surface,
        '--c-surface2': t.surface2,
        '--c-surface3': t.surface3,
        '--c-line': t.line,
        '--c-line2': t.line2,
        '--c-text': t.text,
        '--c-muted': t.muted,
        '--c-faint': t.faint,
        '--c-brand': t.brand,
        '--c-brand-text': t.brandText,
        '--c-brand-ink': t.brandInk,
        '--c-brand-soft': t.brandSoft,
        '--c-brand-line': t.brandLine,
        '--c-accent': t.accent,
        '--c-accent-text': t.accentText,
        '--c-glass': t.glass,
        '--c-glass-line': t.glassLine,
        '--c-live': t.live,
        '--c-win': t.win,
      }),
    [t],
  );

  return (
    <ThemeContext.Provider value={{ t, teamCode }}>
      <View style={themeVars} className="flex-1 bg-canvas">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
