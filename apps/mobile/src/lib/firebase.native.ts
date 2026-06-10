import AsyncStorage from '@react-native-async-storage/async-storage';
import * as fbAuth from 'firebase/auth';
import { connectAuthEmulator, initializeAuth, type Auth, type Persistence } from 'firebase/auth';
import { connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { initFirebase } from '@repo/core';
import { env, firebaseConfig } from './env';

/**
 * Native entry — auth state must be explicitly persisted to AsyncStorage on RN.
 * `getReactNativePersistence` exists in the react-native bundle Metro resolves,
 * but the public web typings omit it, hence the narrow cast.
 */
const getReactNativePersistence = (
  fbAuth as unknown as { getReactNativePersistence: (s: unknown) => Persistence }
).getReactNativePersistence;

const { db: _db, auth: _auth } = initFirebase(firebaseConfig, (app) =>
  initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) }),
);

if (env.USE_FIREBASE_EMULATOR) {
  connectAuthEmulator(_auth, `http://${env.EMULATOR_HOST}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(_db, env.EMULATOR_HOST, 8080);
}

export const auth: Auth = _auth;
export const db: Firestore = _db;
