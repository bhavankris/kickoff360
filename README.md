# kickoff360

FIFA World Cup companion app. Turborepo + pnpm monorepo. Mobile (Expo SDK 56) is
built first; web is a future drop-in. Shared logic lives in `packages/core`.
Firebase backend (Auth, Firestore, Cloud Functions); football data from API-Sports.

> Architecture, rationale, and the phased roadmap live in the engineering setup
> guide this repo was scaffolded from, and in the `CLAUDE.md` files in each package.

## Layout

```
apps/mobile          Expo + Expo Router app (Android first)
packages/core        Shared: types, schemas, api, hooks, theme, firebase factory
packages/functions   Cloud Functions (poll API-Sports → Firestore)
packages/config      Shared tsconfig / eslint / prettier
```

**The Purity Rule:** `packages/core` never imports `react-native`, `next`, or any
platform SDK. Platform code lives in `apps/*` behind `.native.ts` / `.web.ts`
adapters. An ESLint rule enforces this.

## The app

Onboarding (Google → display name → pick your nation, with the whole app
re-theming live to your team's colors), then five tabs: **Home** (your team's
hero match, live now, today's schedule, your group), **Matches** (full
schedule + filters), **Live** (live hub with countdown + empty state),
**Groups** (all 12 tables), **Players** (Golden Boot / Top Assists / Golden
Glove). Every match opens the **Match Centre** — summary timeline, team stats,
formation pitch with lineups, and venue info. Dark/light mode and a
subtle/full theme-takeover toggle live in the profile.

Live scores stream from Firestore via `onSnapshot` (bridged into TanStack
Query), so goals land on every screen in real time.

## Develop

> **New machine?** Follow the full step‑by‑step [End‑to‑End Setup guide
> (Windows & macOS)](docs/SETUP.md) — tooling, env, Firebase/Auth, run modes, and
> troubleshooting. The quickstart below assumes the prerequisites are already installed.

```bash
pnpm install                 # from repo root
pnpm typecheck               # turbo: builds core, then typechecks everything
pnpm build                   # turbo build (core → functions)

cd apps/mobile && pnpm start # Expo dev server
firebase emulators:start     # local Auth + Firestore + Functions

# Demo data (matches / matchDetails / scorers collections):
pnpm --filter @repo/functions seed       # WC2026 dataset, matchday 2 live "now"
pnpm --filter @repo/functions simulate   # real-time goal simulation via Firestore
```

## Manual setup (account-bound — not scaffolded)

These steps need your own accounts/logins. Placeholders are already in the tree;
search for `REPLACE_` to find them.

1. **Firebase project**
   - Console → Add project → create it. Disable Analytics for MVP.
   - Authentication → Sign-in method → enable **Google**; set a support email.
   - Firestore → Create database → Production mode → closest region (permanent).
   - Project settings → Your apps → add **Android** (`in.kickoff360.app`), **iOS**,
     and **Web** (the Web config is what mobile + future web both use).
   - Put the Web config in `apps/mobile/.env` (copy from `.env.example`).
   - Set the project id in `.firebaserc` and `apps/mobile/app.json` (eas projectId after `eas init`).

2. **Google Sign-In**
   - Get the OAuth **Web client id** (Google Cloud → Credentials) → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
   - Register all three Android SHA-1s in Firebase: debug, EAS upload, and
     **Play App Signing** (the last appears only after the first Play submission).
     Missing the Play one is the #1 cause of "sign-in works in dev, breaks in prod".

3. **API-Sports**
   - Create an account, grab the key, store it in Secret Manager (never in the client):
     `cd packages/functions && firebase functions:secrets:set API_SPORTS_KEY`.

4. **EAS (builds)**
   - `pnpm add -g eas-cli && cd apps/mobile && eas init && eas build:configure`.
   - Local build: `cd apps/mobile && pnpm run android` (needs JDK 21 + a booted AVD), or
   - Cloud build: `eas build --profile development --platform android`
     (a native build is required — native Google Sign-In does not work in Expo Go).

5. **CI secrets** (GitHub → Settings → Secrets → Actions)
   - `EXPO_TOKEN`, `FIREBASE_SERVICE_ACCOUNT`, `FIREBASE_PROJECT_ID`
     (and optionally `TURBO_TOKEN` / `TURBO_TEAM` for remote caching).

## Global tools

```bash
pnpm add -g eas-cli firebase-tools     # run `pnpm setup` first if you've never used a pnpm global
# JDK 21 (HotSpot: Temurin/Corretto/Zulu) — required for the Android build AND the
# Firebase Emulator Suite. Use 21, not 17. See docs/SETUP.md §1.3.
```
