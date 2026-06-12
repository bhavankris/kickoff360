import { initFirebase } from '@repo/core';
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
  connectAuthEmulator,
} from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { env, firebaseConfig } from './env';

const useEmulator = env.USE_FIREBASE_EMULATOR;
const EMULATOR_HOST = env.EMULATOR_HOST;

/**
 * Web injects browser auth persistence. Metro/Next resolve this file on web; the
 * base firebase.ts (AsyncStorage) is used on native. core stays platform-agnostic.
 */
export const { app, db, auth } = initFirebase(
  firebaseConfig,
  (a) => {
    const instance = getAuth(a);
    void setPersistence(instance, browserLocalPersistence);
    return instance;
  },
  // The Firestore emulator's WebChannel streaming transport fails in the browser;
  // force long-polling when talking to it.
  useEmulator ? { experimentalForceLongPolling: true } : undefined,
);

if (useEmulator) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, EMULATOR_HOST, 8080);
}
