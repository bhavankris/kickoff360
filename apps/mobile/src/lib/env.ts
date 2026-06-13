/**
 * EXPO_PUBLIC_* env access in one place. Values are inlined by Expo at build
 * time; missing ones fall back to the local emulator-friendly defaults so the
 * app still boots in dev (`USE_FIREBASE_EMULATOR=1` points it at localhost).
 */

// IMPORTANT: each EXPO_PUBLIC_* var MUST be referenced by its literal name with dot
// notation. Expo inlines `process.env.EXPO_PUBLIC_X` at build time via STATIC
// find-and-replace; dynamic access (`process.env[key]`) and destructuring are NOT
// inlined and resolve to undefined on native — they only appear to work on web, which
// has a real runtime process.env. So do NOT reintroduce a `v(key)` indirection here.
export const env = {
  FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? 'demo-key',
  FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'demo-kickoff360.firebaseapp.com',
  FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? 'demo-kickoff360',
  FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? 'demo-kickoff360.appspot.com',
  FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '0',
  FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? 'demo',
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  /** iOS OAuth client id — required by native Google Sign-In on iOS (configure's iosClientId). */
  GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  /** "1" → connect Auth + Firestore to the local emulator suite. */
  USE_FIREBASE_EMULATOR: process.env.EXPO_PUBLIC_USE_FIREBASE_EMULATOR === '1',
  /** Emulator host — set to your machine's LAN IP for a physical device. */
  EMULATOR_HOST: process.env.EXPO_PUBLIC_EMULATOR_HOST ?? 'localhost',
};

export const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
};
