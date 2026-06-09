#!/usr/bin/env node
/**
 * Seed Firestore with the WC2026 demo dataset (matches, matchDetails, scorers).
 *
 * By default kick-offs are SHIFTED so the demo's "now" (mid matchday 2, two
 * matches in play) lands on the real current time — open the app and it looks
 * live. Pass --absolute to keep the real June 2026 calendar dates instead.
 *
 * Targets:
 *   - Emulator:  FIRESTORE_EMULATOR_HOST=localhost:8080 pnpm --filter @repo/functions seed
 *   - Real project: GOOGLE_APPLICATION_CREDENTIALS=key.json GCLOUD_PROJECT=<id> pnpm --filter @repo/functions seed
 */
import admin from 'firebase-admin';
import {
  DEMO_NOW,
  DETAILS,
  MATCHES,
  SCORERS,
  generateMatchday3,
  scorerId,
} from './demo-data.mjs';

const absolute = process.argv.includes('--absolute');
const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID ?? 'demo-kickoff360';

admin.initializeApp({ projectId });
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;

const offsetMs = absolute ? 0 : Date.now() - DEMO_NOW.getTime();
const shift = (iso) => Timestamp.fromDate(new Date(new Date(iso).getTime() + offsetMs));

function matchDoc([matchId, group, matchday, home, away, venueId, kickoff, status, h, a, minute]) {
  return {
    matchId,
    group,
    matchday,
    stage: `Group ${group}`,
    home,
    away,
    venueId,
    kickoff: shift(kickoff),
    status,
    score: h == null ? null : { home: h, away: a },
    minute: minute ?? null,
    lastGoal: null,
    updatedAt: FieldValue.serverTimestamp(),
  };
}

async function main() {
  const all = [...MATCHES, ...generateMatchday3()];
  let batch = db.batch();
  let ops = 0;
  const commitIfFull = async () => {
    if (++ops % 400 === 0) {
      await batch.commit();
      batch = db.batch();
    }
  };

  for (const tuple of all) {
    batch.set(db.doc(`matches/${tuple[0]}`), matchDoc(tuple));
    await commitIfFull();
  }

  for (const [matchId, d] of Object.entries(DETAILS)) {
    batch.set(db.doc(`matchDetails/${matchId}`), {
      matchId,
      stats: d.stats,
      events: d.events,
      lineups: d.lineups
        ? {
            home: { ...d.lineups.home, xi: d.lineups.home.xi.map(([num, name, pos]) => ({ num, name, pos })) },
            away: { ...d.lineups.away, xi: d.lineups.away.xi.map(([num, name, pos]) => ({ num, name, pos })) },
          }
        : null,
      injuries: d.injuries,
      preview: d.preview ?? null,
      referee: d.referee ?? null,
      attendance: d.attendance ?? null,
      weather: d.weather ?? null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await commitIfFull();
  }

  for (const s of SCORERS) {
    batch.set(db.doc(`scorers/${scorerId(s)}`), { ...s, updatedAt: FieldValue.serverTimestamp() });
    await commitIfFull();
  }

  await batch.commit();
  console.log(
    `Seeded ${all.length} matches, ${Object.keys(DETAILS).length} match details, ${SCORERS.length} scorers ` +
      `into project "${projectId}"${process.env.FIRESTORE_EMULATOR_HOST ? ' (emulator)' : ''}.`,
  );
  if (!absolute) {
    console.log(`Kick-offs shifted by ${Math.round(offsetMs / 60000)} min so matchday 2 is happening right now.`);
    console.log('Run `pnpm --filter @repo/functions simulate` to tick the two live matches forward.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
