# kickoff360 — End‑to‑End Setup (Windows & macOS)

A clean, from‑scratch guide to get the monorepo running on a new machine: tooling →
clone → env → Firebase/Auth → run → local backend → deploy. Commands are given for
both **Windows (PowerShell)** and **macOS (zsh/bash)**.

If you just want the fast path: install the prerequisites, then jump to
[5. Fastest run: web + emulator](#5-fastest-run-web--emulator). The native Android
dev build is only needed for real Google Sign‑In on device.

---

## 0. What you're setting up

| Piece | What it is | Needed for |
| --- | --- | --- |
| Node 22 + pnpm 9 | Monorepo runtime + package manager | Everything |
| Expo app (`apps/mobile`) | The client (Android first; runs on web too) | Running the UI |
| Firebase project | Auth + Firestore + Cloud Functions | Sign‑in, data, backend |
| JDK 21 (HotSpot) | Android Gradle build **and** the Firebase Emulator Suite | Android build + local backend |
| Android Studio + SDK | Emulator device / native dev build | Android on device/emulator |
| EAS CLI | Cloud builds (dev build for native Google Sign‑In) | Android APK |
| API‑Sports key | Football data source (server‑side only) | Live polling functions |

The app reads three Firestore collections (`matches`, `matchDetails`, `scorers`). Those
are written by Cloud Functions (or the seed script) — clients never write them. So you
can run the **whole UI** with seeded/emulated data and no API‑Sports key.

---

## 1. Prerequisites

### 1.1 Node.js 22 + pnpm 9.15.4

The repo pins `pnpm@9.15.4` via `packageManager`, and requires Node `>=22`. Use Corepack
(ships with Node) so pnpm's version matches the lockfile exactly.

**Windows (PowerShell):**
```powershell
winget install OpenJS.NodeJS.LTS      # Node 22 LTS
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

**macOS (zsh):**
```bash
brew install node@22
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

Verify (both): `node -v` → v22.x, `pnpm -v` → 9.15.4.

> Prefer a version manager? `nvm-windows` on Windows, `nvm`/`fnm` on macOS. Just land on
> Node 22.

### 1.2 Git

- **Windows:** `winget install Git.Git`
- **macOS:** `brew install git` (or the Xcode Command Line Tools: `xcode-select --install`)

### 1.3 JDK 21 — **HotSpot‑based** (use 21, not 17)

This project has **two** JDK constraints, and **JDK 21** is the version that satisfies both:

1. **Android Gradle build.** Running the app onto the Android emulator (`expo run:android`
   / a local prebuild) **only works on JDK 21** here — JDK 17 fails the Gradle build.
   Expo's generic environment guide suggests Zulu 17; **ignore that for this repo and use
   21.**
2. **Firebase Firestore emulator** needs a **HotSpot** JVM (Temurin, Corretto, or Zulu).
   On **OpenJ9 / IBM Semeru** every emulator write dies with a bare gRPC `2 UNKNOWN`
   (`SizeOf.isCompressedOops` is a HotSpot‑only API). JDK 21 from any of those vendors is
   HotSpot, so it covers this too.

Install a **HotSpot JDK 21**:

- **Windows:** `winget install EclipseAdoptium.Temurin.21.JDK`
- **macOS:** `brew install --cask temurin@21`

On macOS, point `JAVA_HOME` at it in `~/.zshrc` (path is vendor‑specific; for Temurin):
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

Verify: `java -version` should report **21.x** and a HotSpot vendor (`Temurin` / `Zulu` /
`Corretto` — *not* "IBM J9 / OpenJ9").

### 1.4 Global CLIs

```bash
pnpm setup                              # one-time: creates pnpm's global bin dir (skip if done)
pnpm add -g firebase-tools eas-cli
```

(If `pnpm setup` printed PATH changes, open a new terminal first.) Verify:
`firebase --version`, `eas --version`.

### 1.5 Android Studio + emulator (only for Android on device/emulator)

Skip this if you only run the **web** target. These steps mirror Expo's
["Set up your environment" → Android → Development build → Simulated device](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&platform=android&device=simulated)
guide, adapted to this repo.

**Step 1 — Install Android Studio**

- **Windows:** download from [developer.android.com/studio](https://developer.android.com/studio)
  (or `winget install Google.AndroidStudio`). In the Setup Wizard pick **Standard**, and
  make sure **Android Virtual Device** is checked. Accept the licenses.
- **macOS:** `brew install --cask android-studio` (or the website). Run the Setup Wizard →
  **Standard** install.

**Step 2 — Install the SDK components**

Android Studio → **Settings → Languages & Frameworks → Android SDK**:

- **SDK Platforms** tab → enable *Show Package Details* and check **Android SDK Platform 36**
  and **Sources for Android 36** (under Android 16 "Baklava"). This is the API level Expo's
  current guide compiles against.
- **SDK Tools** tab → ensure these are installed: **Android SDK Build‑Tools**,
  **Android Emulator**, **Android SDK Platform‑Tools**, and **Android SDK Command‑line
  Tools (latest)**.

Apply to download.

**Step 3 — Set `ANDROID_HOME` and `PATH`** (include both `platform-tools` *and* `emulator`)

**macOS** — add to `~/.zshrc` (or `~/.bash_profile`), then `source ~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator
```

**Windows** — set these via *Control Panel → User Accounts → Change my environment
variables* (Expo's recommended path; avoids `setx`'s PATH‑truncation footgun):
- New **user variable** `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk`
- Edit **Path** → add `%LOCALAPPDATA%\Android\Sdk\platform-tools`
  and `%LOCALAPPDATA%\Android\Sdk\emulator`

Reopen the terminal and verify: `adb --version` (and `emulator -list-avds` after step 4).

**Step 4 — Create an Android Virtual Device (AVD)**

In Android Studio: **More Actions → Virtual Device Manager → Create virtual device →**
pick a device (e.g. *Pixel 7*) → choose a system image (an **API 36** image; download it
if prompted) → **Finish**. Launch it with the ▶ button, or from the CLI:

```bash
emulator -list-avds          # show your AVD names
emulator -avd <AvdName>      # boot it
```

A booted emulator is what `pnpm run android` builds onto (and what
`eas build … --profile development` installs onto) — see
[7. Run on Android](#7-run-on-android-native-dev-build).

> **macOS only:** `brew install watchman` (Meta's file watcher) makes Metro reloads much
> faster. Expo recommends it; optional but worth it.

---

## 2. Clone & install

```bash
git clone <repo-url> kickoff360
cd kickoff360
pnpm install        # from the repo ROOT — installs all workspaces
```

Sanity check the toolchain (builds `@repo/core`, then typechecks everything):

```bash
pnpm typecheck
```

> **Monorepo note:** `apps/mobile/metro.config.js` sets `watchFolders` to the repo root
> and adds the root `node_modules` to `nodeModulesPaths`. This is what lets Metro resolve
> `@repo/core` from source. If you ever see "Unable to resolve @repo/core", that file is
> the first thing to check.

---

## 3. Environment files

Client config is supplied via `EXPO_PUBLIC_*` env vars, inlined into the bundle at build
time. These are **not secrets** (the Firebase Web config and Google web client id are safe
to ship in a client app).

```bash
cp apps/mobile/.env.example apps/mobile/.env       # macOS/Linux
# Windows PowerShell:
Copy-Item apps/mobile/.env.example apps/mobile/.env
```

`apps/mobile/.env` keys (fill these in step 4):

| Var | Where it comes from |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` … `_APP_ID` | Firebase Console → Project settings → Your apps → **Web app** → SDK config |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud → APIs & Services → Credentials → OAuth 2.0 → **Web client id** |
| `EXPO_PUBLIC_USE_FIREBASE_EMULATOR` | `1` = use local emulator suite; `0` = real project |
| `EXPO_PUBLIC_EMULATOR_HOST` | `localhost` (use your machine's **LAN IP** for a physical device) |

`.env`, `**/.env`, and `**/.secret.local` are gitignored (only `.env.example` is tracked) —
never commit real values.

---

## 4. Firebase & Auth setup

This is the account‑bound part. If you're joining an existing project, you only need the
config values for `.env` and (for Android) your SHA‑1s registered; skip the create steps.

### 4.1 Create / select the project

1. [Firebase Console](https://console.firebase.google.com) → **Add project** (disable
   Analytics for MVP).
2. **Authentication → Sign‑in method →** enable **Google**; set a support email.
   - *(Optional, for the dev bypass below)* also enable **Anonymous**.
3. **Firestore Database → Create database →** Production mode → nearest region (this is
   permanent).
4. **Project settings → Your apps →** add a **Web app**. Copy its SDK config into
   `apps/mobile/.env`. (Add **Android** `in.kickoff360.app` and **iOS** apps too if you'll
   build natively — the Web config is what both mobile and the future web app consume.)
5. Point the repo at your project:
   - `.firebaserc` → `"default": "<your-project-id>"` (currently `kickoff360-dev`).
   - `apps/mobile/app.json` → `extra.eas.projectId` (set after `eas init`).

### 4.2 Deploy security rules & indexes

Firestore rules lock everything down: signed‑in users can **read** the polled/match
collections but never write them; a user can read/write only their own `users/{uid}`
profile (validated fields). Push them:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 4.3 How auth is wired (so you know what to configure)

- **Contract:** `apps/mobile/src/platform/signIn.ts` defines `AuthAdapter`. Metro resolves
  the platform implementation by file extension — `.native.ts` on Android/iOS,
  `.web.ts` on web. Screens import `authAdapter` and never know the platform.
- **Native (`signIn.native.ts`):** `@react-native-google-signin/google-signin` → gets a
  Google `idToken` → `signInWithCredential` into Firebase. Configured with your
  `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. **Requires a dev build** (not Expo Go).
- **Web (`signIn.web.ts`):** `signInWithPopup` with the Google provider. Works in a plain
  browser; Firebase auto‑authorizes `localhost`.
- **Dev bypass (`src/lib/devAuth.ts`):** anonymous sign‑in — pure JS SDK, no native module,
  no OAuth. Great for Expo Go / web / emulator. New user has a real uid but no profile, so
  it routes straight into onboarding. Requires **Anonymous** enabled (4.1). Gated behind
  `__DEV__`.
- **Persistence:** native persists to AsyncStorage (`firebase.native.ts`); web uses
  `browserLocalPersistence` (`firebase.web.ts`). `@repo/core` stays platform‑agnostic and
  the app injects the auth factory.
- **Flow (`AuthProvider`):** `signedOut → loading → needsOnboarding → ready`. After Google
  sign‑in, a user with no `onboardingComplete` profile goes to onboarding (display name +
  pick your nation).

### 4.4 Google Sign‑In on Android — the SHA‑1 requirement

Native Google Sign‑In validates your app's signing certificate. Register **all three**
SHA‑1 fingerprints in Firebase Console → Project settings → Your Android app → *Add
fingerprint*:

1. **Debug** keystore (local dev build)
2. **EAS upload** key
3. **Play App Signing** key — *appears only after your first Play submission*

> Missing the **Play App Signing** SHA‑1 is the #1 cause of "sign‑in works in dev, breaks
> in production." Add it as soon as the app is in Play.

Get the **debug** SHA‑1:

**macOS/Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey -storepass android -keypass android
```

**Windows (PowerShell):**
```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" `
  -alias androiddebugkey -storepass android -keypass android
```

Get the **EAS** SHA‑1: `eas credentials` (select Android → view the upload key).

---

## 5. Fastest run: web + emulator

No native build, no API key — the quickest way to see the app end‑to‑end.

**Terminal 1 — local backend (Auth + Firestore + Functions UI):**
```bash
firebase emulators:start
```
Emulator ports: **Auth 9099**, **Firestore 8080**, **Functions 5001**, Emulator UI on its
own port (printed in the console).

**Terminal 2 — seed demo data into the emulator and run the web app:**
```bash
# point the seed at the emulator, then write the WC2026 demo dataset
# (kick-offs are shifted so matchday 2 is "live" right now)
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions seed
# optional: stream live goals in real time
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions simulate
```

Windows PowerShell uses a different env syntax:
```powershell
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"; pnpm --filter @repo/functions seed
```

Make sure `apps/mobile/.env` has `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=1`, then:
```bash
cd apps/mobile && pnpm web      # opens http://localhost:8081
```

Sign in with the **dev (anonymous)** button, complete onboarding, and you'll see the
seeded live match. (Goals tick in real time if `simulate` is running.)

---

## 6. Run against the real project (web)

1. `apps/mobile/.env`: real Firebase Web config, `EXPO_PUBLIC_USE_FIREBASE_EMULATOR=0`.
2. `cd apps/mobile && pnpm web`.
3. Sign in with Google (web popup) — `localhost` is an authorized domain by default.

Data must already exist in Firestore (from the deployed functions, or a one‑off seed
against the real project — see 8.3).

---

## 7. Run on Android (native dev build)

Native Google Sign‑In and the full native experience need a **native build** — Expo Go
won't work (it lacks the Google Sign‑In native module; the app is coded to boot anyway via
a lazy `require`, but native sign‑in itself is unavailable).

Prerequisites: finish [1.3 (JDK 21)](#13-jdk-21--hotspotbased-use-21-not-17) and
[1.5 (Android Studio + emulator)](#15-android-studio--emulator-only-for-android-on-deviceemulator),
and have an **AVD booted** (or a physical device connected).

### Option A — Local build (simplest; what most dev uses)

From the mobile app folder:

```bash
cd apps/mobile
pnpm run android         # = expo run:android: generates android/, compiles (needs JDK 21), installs & launches
```

`expo run:android` runs the prebuild automatically (no separate `expo prebuild` needed),
compiles the native project — this is the step that **requires JDK 21** — and deploys to
the booted emulator/device. After that, JS edits hot‑reload over Metro; you only re‑run
`pnpm run android` after native or config‑plugin changes.

### Option B — EAS cloud build (no local Android toolchain; shareable APK)

```bash
cd apps/mobile
eas login
eas init                 # creates the EAS project; copy its id into app.json extra.eas.projectId
eas build:configure      # one-time; writes/validates the build profiles
eas build --profile development --platform android
```

When the build finishes, EAS prompts to install it on the running emulator — press **Y**.
Then `pnpm start` and press `a` to open it.

> **Physical device + local emulator suite?** Set `EXPO_PUBLIC_EMULATOR_HOST` to your
> computer's LAN IP (not `localhost`) so the phone can reach the Firebase emulators.

> `apps/mobile/android/` is gitignored (managed workflow), so a fresh clone has no native
> project until `pnpm run android` (Option A) or EAS (Option B) generates it.

> **Physical device + local emulator?** Set `EXPO_PUBLIC_EMULATOR_HOST` to your computer's
> LAN IP (not `localhost`) so the phone can reach the emulator suite.

---

## 8. Cloud Functions (backend)

Functions poll API‑Sports on a schedule and write Firestore. `@repo/core` is consumed as
compiled `dist`, so **core must build before functions** (the build scripts handle the
ordering).

### 8.1 API‑Sports key (server‑side secret)

Never ship this to clients. Store it in Secret Manager:

```bash
cd packages/functions
firebase functions:secrets:set API_SPORTS_KEY
```

For local emulator runs, put it in `packages/functions/.secret.local` (gitignored):
```
API_SPORTS_KEY=your-key-here
```

### 8.2 Build & deploy

```bash
# from repo root — turbo builds @repo/core first, then bundles functions
pnpm build

# deploy
firebase deploy --only functions
```

> `firebase.json` points `functions.source` at `packages/functions/.deploy` (a bundle +
> minimal package.json). This is deliberate — Cloud Build runs plain `npm install`, which
> can't resolve `workspace:*`. Don't repoint it at the package dir.

### 8.3 Seed the real project (optional)

```bash
GOOGLE_APPLICATION_CREDENTIALS=key.json GCLOUD_PROJECT=<project-id> \
  pnpm --filter @repo/functions seed
```
(`key.json` = a service‑account key from Firebase Console → Project settings → Service
accounts.)

### 8.4 The `liveActive` gate (important operational detail)

`pollLiveScores` runs every minute but **no‑ops unless `config/runtime.liveActive == true`**
— this keeps the per‑minute poller cheap on non‑match days. The flag is normally managed
automatically:

- `flipLiveActive` (daily) sets it true when a fixture kicks off within the next 24h.
- `pollSchedule` (hourly) also recomputes it from the fixtures it just fetched, so a fresh
  deploy can't strand the flag for a full day.

If live scores aren't updating even though a match has started, check
`config/runtime.liveActive` in Firestore. You can flip it to `true` manually (Console →
Firestore → `config/runtime`) to unblock immediately; the next poll tick will pick it up.

---

## 9. Verify checklist

- [ ] `node -v` = 22.x, `pnpm -v` = 9.15.4
- [ ] `java -version` shows **21.x** on a HotSpot JVM (Temurin/Corretto/Zulu)
- [ ] `pnpm install` && `pnpm typecheck` pass from the root
- [ ] `apps/mobile/.env` exists and is filled in
- [ ] `firebase emulators:start` boots Auth + Firestore + Functions
- [ ] Seed succeeds; `pnpm web` shows the seeded match
- [ ] Sign‑in works (dev/anonymous on emulator, Google on real project)
- [ ] (Android) dev build installs and native Google Sign‑In completes

---

## 10. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `Unable to resolve @repo/core` in Metro | `metro.config.js` must keep `watchFolders` (repo root) + `nodeModulesPaths`. Restart Metro with `pnpm start -c` to clear cache. |
| Android Gradle build fails / `expo run:android` errors on Java | Use **JDK 21**. JDK 17 (incl. Expo's suggested Zulu 17) fails the Gradle build for this RN version. |
| Firebase emulator write fails with gRPC `2 UNKNOWN` | Wrong JVM. Install a **HotSpot** JDK (Temurin/Corretto/Zulu); OpenJ9/IBM Semeru is unsupported. |
| App boots but native Google Sign‑In throws | You're on **Expo Go**. Native sign‑in needs an **EAS dev build**. Use the dev/anonymous bypass meanwhile. |
| Sign‑in works in dev, fails in production | Missing the **Play App Signing** SHA‑1 in Firebase. Add all three (debug, EAS upload, Play). |
| Functions deploy fails on `workspace:*` | `firebase.json` must point at `packages/functions/.deploy`, not the package dir. Run `pnpm build` first. |
| Live scores don't update after kickoff | `config/runtime.liveActive` is `false`. See [8.4](#84-the-liveactive-gate-important-operational-detail). |
| Firestore emulator hangs on web | The browser WebChannel transport fails against the emulator; the app already forces long‑polling when `USE_FIREBASE_EMULATOR=1`. Ensure that flag is set. |
| Physical device can't reach emulator | Set `EXPO_PUBLIC_EMULATOR_HOST` to your machine's LAN IP, not `localhost`. |
| `onSchedule` functions don't fire locally | They never fire on a schedule in the emulator — invoke them from `firebase functions:shell`. |

---

## Quick reference

```bash
# Install & check (repo root)
pnpm install
pnpm typecheck
pnpm build

# Local backend
firebase emulators:start
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions seed
FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions simulate

# Run the app
cd apps/mobile && pnpm web        # browser
cd apps/mobile && pnpm start      # Expo dev server (dev build)

# Android dev build
cd apps/mobile && pnpm run android                              # local build (needs JDK 21 + booted AVD)
cd apps/mobile && eas build --profile development --platform android   # or cloud build

# Functions
firebase functions:secrets:set API_SPORTS_KEY
firebase deploy --only functions
```

Ports: Auth **9099** · Firestore **8080** · Functions **5001** · Expo web **8081**.
Android application id: `in.kickoff360.app`.
