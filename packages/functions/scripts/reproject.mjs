#!/usr/bin/env node
/**
 * Re-project stored Layer-1 `fixtures` docs into Layer-2 `matches` docs
 * WITHOUT calling API-Sports — the replay path that keeping the raw layer
 * buys us (mapping bugfixes, backfills after schema changes).
 *
 * Build functions first (`pnpm build`) — this imports the compiled projection
 * so script and pollers can never disagree.
 *
 * Targets:
 *   - Emulator:  FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions reproject
 *   - Real project: GOOGLE_APPLICATION_CREDENTIALS=key.json GCLOUD_PROJECT=<id> ... reproject
 */
import admin from 'firebase-admin';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { projectFixture } = require('../lib/lib/project.js');

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-kickoff360';
admin.initializeApp({ projectId });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

const snap = await db.collection('fixtures').get();
let projected = 0;
let skipped = 0;
const batch = db.batch();

for (const doc of snap.docs) {
  const f = doc.data();
  try {
    const match = projectFixture(f);
    if (!match) {
      skipped += 1;
      continue;
    }
    batch.set(
      db.doc(`matches/${match.matchId}`),
      { ...match, kickoff: f.utcKickoff, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
    projected += 1;
  } catch (e) {
    skipped += 1;
    console.warn(`reproject: skipped fixture ${doc.id}:`, e.message ?? e);
  }
}

await batch.commit();
console.log(`reproject: ${projected} matches projected, ${skipped} skipped, from ${snap.size} fixtures`);
