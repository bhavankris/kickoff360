# apps/mobile — Expo App (Android first)

Expo SDK 56 + Expo Router 56 + NativeWind v4. Consumes `@repo/core` for all data logic.

## Layout
- `src/app/`        Expo Router routes ONLY. Each route re-exports a screen body.
  - `(auth)/sign-in`            — Google sign-in
  - `(onboarding)/profile-setup` — display name + country
  - `(app)/` tabs               — index (Schedule), scores, table, players
- `src/screens/`    Screen bodies (the actual UI). Routes re-export these.
- `src/providers/`  AppProviders (Query + SafeArea + Gesture), AuthProvider, ThemeProvider
- `src/platform/`   `.native.ts` / `.web.ts` adapters (Google Sign-In). Contract in signIn.ts.
- `src/lib/`        firebase.ts (injects AsyncStorage persistence), env.ts (EXPO_PUBLIC_*)
- `src/theme/`      vars.ts — turns core palette data into NativeWind vars()
- `src/store/`      Zustand — UI state ONLY

## Rules
- `app/` holds routes only; put UI in `src/screens` and re-export.
- Data logic comes from `@repo/core` (api/hooks). Never query Firestore from a screen directly.
- Platform code goes behind `.native.ts`/`.web.ts`. Keep `@repo/core` pure.
- Style with NativeWind classes; theme colours (`bg-primary`, `text-ink`) come from CSS vars.

## Setup before running
1. `cp .env.example .env` and fill in the Firebase Web config + Google web client id.
2. Google Sign-In needs a dev build (not Expo Go): `eas build --profile development --platform android`.

## Commands (from this dir)
- `pnpm start` / `pnpm android` / `pnpm web`
- `pnpm typecheck`
- `eas build --profile development --platform android`

## Gotchas
- `metro.config.js` must keep `watchFolders` + `nodeModulesPaths` or @repo/core won't resolve.
- Don't use Expo Go past day one — native Google Sign-In needs a dev build.
- Register all three Android SHA-1s (debug, EAS upload, Play App Signing) in Firebase.
