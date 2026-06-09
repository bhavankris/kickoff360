# kickoff360 — Monorepo Context

## What this is
Turborepo + pnpm monorepo for a FIFA World Cup companion app. Mobile (Expo SDK 56)
is built day one; web is a future drop-in. Shared logic lives in `packages/core`.
Firebase backend (Auth, Firestore, Cloud Functions). Football data from API-Sports
(polled by functions, never by clients).

## Layout
- `apps/mobile`      Expo + Expo Router app (Android first)
- `apps/web`         FUTURE — do not assume it exists yet
- `packages/core`    Shared: types, schemas, api, hooks, theme, firebase factory
- `packages/functions`  Cloud Functions (imports @repo/core)
- `packages/config`  Shared tsconfig / eslint / prettier

## THE PURITY RULE (most important)
`packages/core` MUST NOT import `react-native`, `next`, or any platform SDK.
Allowed in core: TypeScript, React (hooks), `firebase` (JS SDK), `zod`, `@tanstack/react-query`.
Platform code (Google Sign-In, storage) goes in `apps/*` behind `.native.ts` / `.web.ts` adapters.
This single rule lets a future web app reuse 100% of core.

## Stack (pinned — do not bump without discussion)
- Expo SDK 56, Expo Router 56, RN 0.85, React 19
- Firebase JS SDK v12 (client + core), firebase-functions v7 / Node 22
- TanStack Query v5 (server state) + Zustand v5 (UI state ONLY)
- NativeWind v4.2 (Tailwind v3.4.17). Turborepo v2. pnpm 9.

## Rules
- Data logic lives in `packages/core` (api/hooks), NEVER in screen components.
- `app/` holds Expo Router routes ONLY; screens re-export from `src/screens`.
- Server state via TanStack Query; Zustand is UI state only.
- NEVER call API-Sports from a client. Functions poll → Firestore.
- Firestore schema source of truth: `packages/core/src/types` + `/schemas`.
- Country codes are ISO 3166-1 alpha-3 (e.g. "BRA").
- Android application id: `in.kickoff360.app`.

## Commands (run from repo root)
- `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm typecheck`   # via turbo
- `cd apps/mobile && pnpm start`                         # Expo dev server
- `cd apps/mobile && eas build --profile development --platform android`
- `firebase emulators:start`                             # local backend

## Gotchas
- `metro.config.js` needs `watchFolders=monorepoRoot` + `nodeModulesPaths` (or @repo/core won't resolve).
- Mobile consumes core's TS source; functions consume core's compiled `dist` (build core first).
- Google Sign-In needs a dev build + all 3 Android SHA-1s in Firebase.
- `onSchedule` OBJECT form only (string form has a Cloud Scheduler URL bug).
