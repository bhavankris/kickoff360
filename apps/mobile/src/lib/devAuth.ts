import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Dev-only sign-in bypass. Uses Firebase **anonymous** auth — pure JS SDK, so it needs
 * no native module (works in Expo Go) and no Google OAuth setup. The new user has a real
 * Firebase uid but no Firestore profile, so AuthProvider routes it straight into
 * onboarding, exactly like a first-time Google sign-in.
 *
 * Requires Anonymous sign-in enabled once in the Firebase console
 * (Authentication → Sign-in method → Anonymous), or the local Auth emulator.
 *
 * The calling UI is gated behind `__DEV__`, so this never reaches a release build.
 */
export async function devSignIn() {
  return (await signInAnonymously(auth)).user;
}
