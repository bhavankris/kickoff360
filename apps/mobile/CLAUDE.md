# apps/mobile — Expo App (Android first)

Expo SDK 56 + Expo Router 56 + NativeWind v4. Consumes `@repo/core` for all data logic.

## Layout
- `src/app/`        Expo Router routes ONLY. Each route re-exports a screen body.
  - `(auth)/sign-in`             — welcome + Google sign-in
  - `(onboarding)/profile-setup` — display name + pick-your-nation (live re-theme)
  - `(app)/(tabs)/`              — index (Home), matches, live, groups, players
  - `(app)/match/[id]`           — Match Centre (Summary / Stats / Lineups / Info)
  - `(app)/profile`              — profile modal (team change, theme, appearance)
- `src/screens/`    Screen bodies (the actual UI). Routes re-export these.
- `src/components/` Shared UI kit: ui (Icon/Flag/Pill/Card…), matchui, TabBar,
                    HeaderGradient, LiveCountdown, PitchLineup
- `src/providers/`  AppProviders (Query + SafeArea + Gesture), AuthProvider, ThemeProvider
- `src/platform/`   `.native.ts` / `.web.ts` adapters (Google Sign-In). Contract in signIn.ts.
- `src/lib/`        firebase.ts/.native.ts (auth persistence per platform, emulator wiring),
                    env.ts (EXPO_PUBLIC_*)
- `src/theme/`      fonts.ts — Archivo/Space Mono loading (styled via `font-archivo-*` classes)
- `src/store/`      Zustand — UI state ONLY (prefs: mode, intensity, onboarding preview team)

## Theming (NativeWind)
`ThemeProvider` resolves `computeTheme(countryCode, { mode, intensity })` from core and
publishes every token as a CSS variable via NativeWind `vars()` (`--c-surface`, `--c-text`, …).
`tailwind.config.js` maps those vars to semantic colors, so screens style with utility
classes — `bg-surface`, `text-ink`, `border-line`, `text-brand-text` — and the whole app
re-tints when the favourite team / mode / intensity changes. The favourite team comes from
the Firestore profile; during onboarding `prefs.previewTeam` drives the live re-theme.
Reach for `useTheme().t` (raw token strings) only where className can't: SVG props,
gradient stops, ActivityIndicator/StatusBar, Animated values. Fonts map to classes too
(`font-archivo-extrabold`, `font-mono-bold`); `fontVariant: ['tabular-nums']` stays inline
(NativeWind doesn't compile font-variant-numeric).

## Rules
- `app/` holds routes only; put UI in `src/screens` and re-export.
- Data logic comes from `@repo/core` (api/hooks). Never query Firestore from a screen directly.
- Platform code goes behind `.native.ts`/`.web.ts`. Keep `@repo/core` pure.
- Style with NativeWind `className` utilities; colours come from the theme-token classes
  (`bg-canvas`, `bg-surface`, `text-ink`, `text-brand-text`, …) so the team takeover +
  dark/light always apply. Inline `style` is reserved for runtime-computed values.

## Setup before running
1. `cp .env.example .env` and fill in the Firebase Web config + Google web client id
   (or set `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1` for the local emulator suite).
2. Seed demo data: `pnpm --filter @repo/functions seed` (and `… simulate` for live goals).
3. Google Sign-In needs a dev build (not Expo Go): `eas build --profile development --platform android`.

## Commands (from this dir)
- `pnpm start` / `pnpm android` / `pnpm web`
- `pnpm typecheck`
- `eas build --profile development --platform android`

## Gotchas
- `metro.config.js` must keep `watchFolders` + `nodeModulesPaths` or @repo/core won't resolve.
- Don't use Expo Go past day one — native Google Sign-In needs a dev build.
- Register all three Android SHA-1s (debug, EAS upload, Play App Signing) in Firebase.
