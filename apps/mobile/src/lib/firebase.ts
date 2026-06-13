import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { initFirebase } from '@repo/core';
import { env, firebaseConfig } from './env';

/**
 * Web entry — Metro picks firebase.native.ts on Android/iOS. Browser auth
 * persists to localStorage by default, so plain getAuth is enough here.
 */

const { db: _db, auth: _auth } = initFirebase(firebaseConfig, (app) => getAuth(app), {
  // The Firestore emulator over a proxied dev tunnel needs long-polling.
  experimentalAutoDetectLongPolling: true,
});

if (env.USE_FIREBASE_EMULATOR) {
  connectAuthEmulator(_auth, `http://${env.EMULATOR_HOST}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(_db, env.EMULATOR_HOST, 8080);
}

export const auth: Auth = _auth;
export const db: Firestore = _db;
