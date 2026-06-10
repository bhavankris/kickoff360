import * as admin from 'firebase-admin';

/**
 * Shared Admin SDK singleton for all functions. The Admin SDK bypasses
 * Security Rules — that is the design: polled collections are client-read-only
 * and only these functions write them.
 */
if (!admin.apps.length) {
  admin.initializeApp();
}

export { admin };
export const db = admin.firestore();

/** API-Sports league id for the FIFA World Cup. */
export const DEFAULT_LEAGUE_ID = 1;
export const DEFAULT_SEASON = 2026;
