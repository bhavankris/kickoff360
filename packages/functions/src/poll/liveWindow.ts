import { onSchedule } from 'firebase-functions/v2/scheduler';
import { admin, db, DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '../lib/admin.js';

/**
 * Daily: flip config/runtime.liveActive so pollLiveScores only runs on match days.
 * Reads fixtures already stored by pollSchedule (no API call) — true if any fixture
 * kicks off in the next 24h. Keeps the every-minute live poller cheap off-days.
 */
export const flipLiveActive = onSchedule(
  {
    schedule: 'every 24 hours',
    timeZone: 'Etc/UTC',
    region: 'us-central1',
    memory: '256MiB',
    retryCount: 1,
  },
  async () => {
    const now = admin.firestore.Timestamp.now();
    const in24h = admin.firestore.Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

    const snap = await db
      .collection('fixtures')
      .where('utcKickoff', '>=', now)
      .where('utcKickoff', '<=', in24h)
      .limit(1)
      .get();

    const liveActive = !snap.empty;
    await db.doc('config/runtime').set(
      { liveActive, leagueId: DEFAULT_LEAGUE_ID, season: DEFAULT_SEASON },
      { merge: true },
    );
    console.log(`flipLiveActive: liveActive=${liveActive}`);
  },
);
