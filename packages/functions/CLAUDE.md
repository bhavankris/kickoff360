# packages/functions — Cloud Functions

Firebase Cloud Functions (2nd gen, Node 22). Poll API-Sports → write Firestore.
Imports `@repo/core` (compiled `dist`) for shared types and Zod schemas.

## Rules
- NEVER expose the API-Sports key to clients. It lives in Secret Manager
  (`firebase functions:secrets:set API_SPORTS_KEY`) and is read via `defineSecret`.
- Validate every raw API payload with the Zod schemas from `@repo/core/schemas`
  before writing (Layer 3). Clients can't write these collections (Security Rules).
- Use the `onSchedule` OBJECT form only — the string form has a Cloud Scheduler URL
  bug (firebase/firebase-functions#1734).
- Keep documents denormalized (team name + logo inside each fixture) — Firestore bills per read.

## Build order & deploy artifact
core must be compiled before functions: `turbo run build --filter=@repo/functions`
builds `@repo/core` first (tsc --noEmit type-checks against its `dist`).
`pnpm build` then ESBUILD-BUNDLES @repo/core + zod into `lib/` (externals:
firebase-admin, firebase-functions, undici) and assembles `.deploy/` — the
bundle + a minimal package.json with ONLY those three deps. firebase.json's
`functions.source` points at `.deploy/` because Cloud Build runs plain
`npm install`, which cannot resolve `workspace:*` (even in devDependencies —
tested). Never point it back at the package dir.

## Polling plan (well under 75,000/day)
- pollSchedule     hourly        ~24/day
- pollStandings    hourly        ~24/day
- pollTopPlayers   every 12h     ~4/day (topscorers + topassists)
- pollLiveScores   every minute, ONLY when config/runtime.liveActive  (<= ~1,440/day)
- pollMatchDetails every minute, same gate; events/lineups/stats for matches
                   near kick-off only (~8/min inside live windows; finals are
                   fetched once then flagged `final` and skipped)
- flipLiveActive   daily         flips liveActive on match days (no API call)

## Commands
- `pnpm build` / `pnpm typecheck`
- `pnpm serve`    # build + emulators (functions, firestore, auth)
- `pnpm run deploy`  # firebase deploy --only functions (`run` is required —
                     # bare `pnpm deploy` hits pnpm's built-in deploy command)
- `firebase functions:secrets:set API_SPORTS_KEY`

## Local testing gotchas
- The Firestore emulator needs a HotSpot JVM (Temurin/Corretto/Zulu). On OpenJ9
  (IBM Semeru) every write dies inside the emulator with a bare gRPC `2 UNKNOWN`
  (`SizeOf.isCompressedOops` uses a HotSpot-only API). Check `java -version` first.
- Import firebase-admin via the modular paths (`firebase-admin/app`,
  `firebase-admin/firestore`). The functions emulator proxies the legacy
  `import * as admin` namespace and loses statics like `admin.firestore.Timestamp`.
- Secrets for local runs live in `.secret.local` (e.g. `API_SPORTS_KEY=...`).
- `onSchedule` functions never fire on a schedule locally — invoke them from
  `firebase functions:shell` (with `FIRESTORE_EMULATOR_HOST=localhost:8080`
  exported in that terminal, and the emulator started first).

## Two-layer model
Pollers write BOTH layers in one batch: raw API-shaped docs (`fixtures`,
`standings`, `players` — tournament-agnostic, numeric ids) AND the screen-shaped
projections the app renders (`matches` via `lib/project.ts`, `matchDetails` via
`lib/projectDetail.ts`, `scorers` in topPlayers; alpha-3 codes from
`@repo/core/data`). `pnpm reproject` replays fixtures → matches without API
calls (mapping fixes, backfills).

## Demo data (scripts/)
The app renders the `matches` / `matchDetails` / `scorers` collections.
NOTE: the demo dataset still uses the pre-draw mock teams (ITA, CMR, DEN…) —
out of sync with the real WC2026 draw now in `@repo/core/data/teams`; seeded
demo matches render gray flags / sparse group tables. Prefer real polled data;
the demo remains useful for the live-goal simulation:
- `pnpm seed`      writes the WC2026 demo dataset; kick-offs are shifted so
                   matchday 2 (two live matches) is happening right now.
                   `--absolute` keeps the real June 2026 dates.
- `pnpm simulate`  ticks the two live matches forward in real time (goals,
                   cards, FT) so every open client updates via onSnapshot.
Both target the emulator when `FIRESTORE_EMULATOR_HOST` is set, otherwise the
project from `GCLOUD_PROJECT` / `GOOGLE_APPLICATION_CREDENTIALS`.
