import { onSchedule } from 'firebase-functions/v2/scheduler';
import { defineSecret } from 'firebase-functions/params';
import { admin, db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '../lib/admin.js';
import { apiSports } from '../lib/apiSports.js';
import { mapFixture, type RawFixture } from '../lib/map.js';

const API_SPORTS_KEY = defineSecret('API_SPORTS_KEY');

/** Hourly: refresh the full fixtures schedule for the season. ~24 calls/day. */
export const pollSchedule = onSchedule(
  {
    schedule: 'every 60 minutes',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    secrets: [API_SPORTS_KEY],
    retryCount: 1,
  },
  async () => {
    const raw = await apiSports<RawFixture[]>(API_SPORTS_KEY.value(), '/fixtures', {
      league: DEFAULT_LEAGUE_ID,
      season: DEFAULT_SEASON,
    });

    const batch = db.batch();
    let written = 0;
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
        written += 1;
      } catch (e) {
        console.warn('pollSchedule: skipped invalid fixture', e);
      }
    }
    await batch.commit();
    console.log(`pollSchedule: wrote ${written}/${raw.length} fixtures`);
  },
);
