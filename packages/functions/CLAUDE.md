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

## Build order
core must be compiled before functions: `turbo run build --filter=@repo/functions`
builds `@repo/core` first (functions read its `dist`, not its source).

## Polling plan (well under 75,000/day)
- pollSchedule    hourly        ~24/day
- pollStandings   hourly        ~24/day
- pollTopPlayers  every 12h     ~2/day
- pollLiveScores  every minute, ONLY when config/runtime.liveActive  (<= ~1,440/day)
- flipLiveActive  daily         flips liveActive on match days (no API call)

## Commands
- `pnpm build` / `pnpm typecheck`
- `pnpm serve`    # build + emulators (functions, firestore, auth)
- `pnpm deploy`   # firebase deploy --only functions
- `firebase functions:secrets:set API_SPORTS_KEY`
