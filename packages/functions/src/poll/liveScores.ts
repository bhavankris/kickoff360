import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { admin, db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';
import { mapFixture, type RawFixture } from '../lib/map.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

/**
 * Every minute, but ONLY on match days: a separate daily function flips
 * config/runtime.liveActive so this no-ops off-days. Worst-case match day < ~2,000 calls.
 * Use the onSchedule OBJECT form — the string-only form mis-wires the Scheduler URL
 * (firebase/firebase-functions#1734).
 */
export const pollLiveScores = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const cfg = await db.doc('config/runtime').get();
    if (!cfg.exists || !cfg.get('liveActive')) return;

    const raw = await apiSports<RawFixture[]>(API_SPORTS_KEY.value(), '/fixtures', {
      live: 'all',
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    const batch = db.batch();
    for (const r of raw) {
      try {
        const { fixture, kickoff } = mapFixture(r);
        batch.set(
          db.doc(`fixtures/${fixture.fixtureId}`),
          {
            ...fixture,
            utcKickoff: admin.firestore.Timestamp.fromDate(kickoff),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      } catch (e) {
        console.warn('pollLiveScores: skipped invalid fixture', e);
      }
    }
    await batch.commit();
    console.log(`pollLiveScores: updated ${raw.length} live fixtures`);
  },
);
