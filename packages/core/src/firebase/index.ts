import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  type Firestore,
  type FirestoreSettings,
} from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

/**
 * Platform-agnostic Firebase factory. core never imports AsyncStorage or browser
 * APIs — the app injects an `authFactory` so each platform supplies its own
 * persistence strategy (PURITY RULE).
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

let db: Firestore | undefined;

export function initFirebase(
  cfg: FirebaseConfig,
  authFactory: (a: FirebaseApp) => Auth,
  firestoreSettings?: FirestoreSettings,
) {
  const existing = getApps();
  const app = existing.length ? existing[0]! : initializeApp(cfg);
  // initializeFirestore lets the app opt into settings (e.g. long-polling for the
  // emulator on web); plain getFirestore is used otherwise. Guard against re-init
  // when the app instance already exists (e.g. Fast Refresh).
  db = firestoreSettings && !existing.length ? initializeFirestore(app, firestoreSettings) : getFirestore(app);
  const auth = authFactory(app);
  return { app, db, auth };
}

export function getDb(): Firestore {
  if (!db) {
    throw new Error('Firebase not initialized — call initFirebase() before getDb().');
  }
  return db;
}
