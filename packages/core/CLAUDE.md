# packages/core — Shared Heart

Platform-agnostic business logic shared by mobile, the future web app, and Cloud Functions.

## THE PURITY RULE
This package MUST NOT import `react-native`, `next`, `expo`, AsyncStorage, or any
platform SDK. Allowed: TypeScript, React (hooks only), `firebase` (JS SDK), `zod`,
`@tanstack/react-query`. An ESLint rule (`corePurity` in @repo/config) enforces this.
If you need a platform API, define an interface here and inject the implementation
from the app.

## Layout
- `src/types`     Firestore document types (Layer 1 schema source of truth)
- `src/schemas`   Zod schemas (Layer 3) — derive TS types from these where possible
- `src/api`       Firestore queries + converters (Layer 2). No UI.
- `src/hooks`     TanStack Query hooks; `useFirestoreSubscription` ref-counts onSnapshot
- `src/theme`     Country palette data (pure RGB triples)
- `src/firebase`  `initFirebase` factory — auth persistence is injected by the app
- `src/utils`     Pure helpers

## Dual consumption
Bundlers (Metro/web) read `src` directly via the `import` export condition — no build
step in the dev loop. Node (Cloud Functions) reads compiled `dist` via `default`.
Run `pnpm build` before functions build/deploy.
