import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';

/**
 * Shared Admin SDK singleton for all functions. The Admin SDK bypasses
 * Security Rules — that is the design: polled collections are client-read-only
 * and only these functions write them.
 * Use the modular entry points (firebase-admin/app, firebase-admin/firestore):
 * the Functions emulator proxies the legacy `firebase-admin` namespace import
 * and loses statics like `admin.firestore.Timestamp` in the process.
 */
if (!getApps().length) {
  initializeApp();
}

export const db = getFirestore();
export { FieldValue, Timestamp };

/** API-Sports league id for the FIFA World Cup. */
export const DEFAULT_LEAGUE_ID = 1;
export const DEFAULT_SEASON = 2026;
